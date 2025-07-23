"use client";
import type React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Controller, useForm } from "react-hook-form";
import FormattedNumberInput from "./components/FormattedNumberInput";
import { cleanNumberForAPI, formatNumber } from "./utils/number";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListExchangeRatesResponse } from "./api/model";
import API from "./api/axios";
import { DateTime } from "luxon";
import LoadingDialog from "./components/LoadingDialog";

const createExchangeRate = async (payload: {
  exchangeRate: string;
  effectedAt: string;
}): Promise<void> => {
  try {
    const response = await API.post("/v1/xrates", payload);
    if (response.status !== 200) {
      throw new Error("Failed to create exchange rate");
    }
    return;
  } catch {
    throw new Error("Failed to create exchange rate");
  }
};

// New API function for toggling status
const toggleExchangeRateStatus = async (id: string): Promise<void> => {
  try {
    const response = await API.patch(`/v1/xrates/${id}/activate`);
    if (response.status !== 200) {
      throw new Error("Failed to toggle exchange rate status");
    }
    return;
  } catch {
    throw new Error("Failed to toggle exchange rate status");
  }
};

export default function App() {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string | null>();
  const [pageToken, setPageToken] = useState<string>("");
  const [previousToken, setPreviousToken] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [pageNumber, setPageNumber] = useState<number>(0);

  // New state for audio playback
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExchangeRate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listExchangeRates", pageToken, pageSize],
      });
      setSuccess("Exchange rate created successfully");
      setShowSnackbar(true);
      reset(); // Reset form after successful submission
    },
    onError: () => {
      setError("Failed to create exchange rate");
      setShowSnackbar(true);
    },
  });

  // New mutation for toggling status
  const toggleStatusMutation = useMutation({
    mutationFn: toggleExchangeRateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listExchangeRates", pageToken, pageSize],
      });
      setSuccess("Exchange rate uploaded to Avaya successfully");
      setShowSnackbar(true);
    },
    onError: () => {
      setError("Failed to upload exchange rate to Avaya");
      setShowSnackbar(true);
    },
  });

  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      exchangeRate: "",
      effectedAt: DateTime.local().toFormat("yyyy-MM-dd"),
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const {
    data: histories,
    isLoading,
    error: isError,
  } = useQuery<ListExchangeRatesResponse>({
    queryKey: ["listExchangeRates", pageToken, pageSize],
    queryFn: async () => {
      const apiURL = new URL(`${import.meta.env.VITE_API_BASE_URL}/v1/xrates`);
      apiURL.searchParams.set("pageSize", pageSize.toString());
      if (pageToken) {
        apiURL.searchParams.set("pageToken", pageToken);
      }
      const response = await API.get<ListExchangeRatesResponse>(
        apiURL.toString()
      );
      if (response.status !== 200) {
        throw Error("Failed to list exchange rates");
      }
      return response.data;
    },
  });

  // New audio playback functions
  const handlePlayAudio = (rateId: string, audioFileName?: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (currentPlayingId === rateId && isPlaying) {
      // If clicking the same row while playing, pause it
      setIsPlaying(false);
      setCurrentPlayingId(null);
      return;
    }

    const url = new URL(
      `${import.meta.env.VITE_API_BASE_URL}/v1/audio/${audioFileName}`
    );
    audioRef.current = new Audio(url.toString());
    audioRef.current.crossOrigin = "anonymous";

    audioRef.current.onloadeddata = () => {
      audioRef.current?.play();
      setCurrentPlayingId(rateId);
      setIsPlaying(true);
    };

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    };

    audioRef.current.onerror = () => {
      setError("Failed to load audio file");
      setShowSnackbar(true);
      setIsPlaying(false);
      setCurrentPlayingId(null);
    };
  };

  // New function for toggling status
  const handleToggleStatus = (rateId: string) => {
    toggleStatusMutation.mutate(rateId);
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleOnSubmit = (data: {
    exchangeRate: string;
    effectedAt: string;
  }) => {
    const effectedAt = DateTime.fromJSDate(new Date(data.effectedAt), {
      zone: "Asia/Vientiane",
    }).toFormat("yyyy-MM-dd");

    mutation.mutate({
      exchangeRate: cleanNumberForAPI(data.exchangeRate).toString(),
      effectedAt: effectedAt,
    });
    // Don't reset here, let mutation handle it on success
  };

  const handleCancel = () => {
    reset();
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPageSize(Number.parseInt(event.target.value));
  };

  const getPreviousToken = (): string => {
    const token = previousToken[previousToken.length - 1];
    setPreviousToken((t) => t.slice(0, t.length - 1));
    return token;
  };

  const handPreviousToken = (token: string) => {
    setPreviousToken((t) => [...t, token]);
  };

  const indexOfLastItem = (pageNumber + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  // Determine if any loading is happening
  const isAnyLoading = mutation.isPending || toggleStatusMutation.isPending;

  // Get loading message based on which action is running
  const getLoadingMessage = () => {
    if (mutation.isPending) return "Saving Exchange Rate";
    if (toggleStatusMutation.isPending) return "Uploading to Avaya";
    return "Processing...";
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Form Section */}
            <Card elevation={2}>
              <CardHeader
                title={
                  <Typography variant="h5" component="h1" gutterBottom>
                    Exchange Rate Management
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Create new exchange rate (USD to LAK)
                  </Typography>
                }
              />
              <CardContent>
                <form onSubmit={handleSubmit(handleOnSubmit)}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name="exchangeRate"
                        control={control}
                        rules={{
                          required: "Exchange Rate is required",
                          pattern: {
                            value: /^[0-9]{1,3}(,[0-9]{3})*$/,
                            message: "Invalid exchange rate format",
                          },
                        }}
                        render={({
                          field: { ref: fieldRef, value, ...fieldProps },
                          fieldState,
                        }) => (
                          <FormattedNumberInput
                            fullWidth
                            {...fieldProps}
                            inputRef={fieldRef}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            label="Exchange Rate (LAK per USD)"
                            placeholder="Enter exchange rate"
                            value={value}
                            variant="outlined"
                            size="small"
                            disabled={isAnyLoading} // Disable during any loading
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, decimal point
                              const allowedKeys = [
                                "Backspace",
                                "Delete",
                                "Tab",
                                "Escape",
                                "Enter",
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                                "Home",
                                "End",
                                ".",
                              ];

                              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                              if (
                                e.ctrlKey &&
                                ["a", "c", "v", "x", "z"].includes(
                                  e.key.toLowerCase()
                                )
                              ) {
                                return;
                              }

                              // Allow navigation and special keys
                              if (allowedKeys.includes(e.key)) {
                                return;
                              }

                              // Allow numbers 0-9
                              if (e.key >= "0" && e.key <= "9") {
                                return;
                              }

                              // Block everything else
                              e.preventDefault();
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name="effectedAt"
                        control={control}
                        rules={{ required: "Date for Effect is required" }}
                        render={({
                          field: { ref: fieldRef, value, ...fieldProps },
                          fieldState,
                        }) => (
                          <DatePicker
                            label="Date for Effect"
                            value={new Date(value)}
                            format="dd/MM/yyyy"
                            disabled={isAnyLoading} // Disable during any loading
                            onChange={(newValue) =>
                              fieldProps.onChange(newValue)
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: "outlined",
                                size: "small",
                                inputRef: fieldRef,
                                error: !!fieldState.error,
                                helperText: fieldState.error?.message,
                                ...fieldProps,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mt: 2,
                    }}>
                    <Button
                      startIcon={<SaveIcon />}
                      size="small"
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isAnyLoading} // Disable during any loading
                      sx={{ minWidth: 120 }}>
                      Save
                    </Button>
                    <Button
                      startIcon={<ClearIcon />}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={handleCancel}
                      disabled={isAnyLoading} // Disable during any loading
                      sx={{ minWidth: 120 }}>
                      Clear
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>

            {/* History Section */}
            <Card elevation={2}>
              <CardHeader
                title={
                  <Typography variant="h5" component="h2" gutterBottom>
                    Exchange Rate History
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Historical exchange rates (USD to LAK)
                  </Typography>
                }
              />
              <CardContent>
                {isLoading && (
                  <Box sx={{ padding: 2 }}>
                    <Skeleton />
                    <Skeleton animation="wave" />
                    <Skeleton animation={false} />
                  </Box>
                )}
                {isError && (
                  <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
                    [Error] Something went wrong. Please try again later
                  </Alert>
                )}
                {histories && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table
                      size="small"
                      stickyHeader
                      sx={{ minWidth: 650 }}
                      aria-label="exchange rate history table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "grey.50" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>No</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Date Effect
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Exchange Rate (LAK/USD)
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Created At
                          </TableCell>
                          {/* New Audio Column */}
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Audio
                          </TableCell>
                          {/* New Status Column */}
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {histories.exchangeRates.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              {" "}
                              {/* Updated colspan */}
                              No data found
                            </TableCell>
                          </TableRow>
                        )}
                        {histories.exchangeRates.map((rate, idx) => (
                          <TableRow
                            key={rate.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}>
                            <TableCell
                              component="th"
                              scope="row"
                              sx={{ fontWeight: "medium" }}>
                              {idx + 1 + indexOfFirstItem}
                            </TableCell>
                            <TableCell>
                              {DateTime.fromISO(rate.effectedAt, {
                                zone: "Asia/Vientiane",
                              }).toFormat("dd/MM/yyyy")}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: "medium",
                              }}>
                              {formatNumber(rate.exchangeRate)}
                            </TableCell>
                            <TableCell>
                              {DateTime.fromISO(rate.createdAt, {
                                zone: "Asia/Vientiane",
                              }).toFormat("dd/MM/yyyy HH:mm:ss")}
                            </TableCell>
                            {/* New Audio Cell */}
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handlePlayAudio(rate.id, rate.audioFileName)
                                }
                                color={
                                  currentPlayingId &&
                                  currentPlayingId === rate.id &&
                                  isPlaying
                                    ? "primary"
                                    : "default"
                                }
                                disabled={
                                  (currentPlayingId !== null &&
                                    currentPlayingId !== rate.id &&
                                    isPlaying) ||
                                  isAnyLoading // Disable during any loading
                                }>
                                {currentPlayingId === rate.id && isPlaying ? (
                                  <PauseIcon />
                                ) : (
                                  <PlayArrowIcon />
                                )}
                              </IconButton>
                            </TableCell>
                            {/* New Status Cell */}
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}>
                                <Chip
                                  label={
                                    rate.status === "ACTIVE"
                                      ? "Active"
                                      : "Inactive"
                                  }
                                  color={
                                    rate.status === "ACTIVE"
                                      ? "success"
                                      : "default"
                                  }
                                  size="small"
                                />
                                {rate.status === "ACTIVE" ? (
                                  <></>
                                ) : (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleStatus(rate.id)}
                                    disabled={isAnyLoading} // Disable during any loading
                                    color="primary">
                                    <Tooltip title="Upload to Avaya">
                                      <CheckCircleIcon />
                                    </Tooltip>
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <TablePagination
                  component="div"
                  rowsPerPage={pageSize}
                  page={pageNumber}
                  count={histories ? histories.exchangeRates.length : 0}
                  onPageChange={() => {}}
                  onRowsPerPageChange={handlePageSizeChange}
                  labelRowsPerPage="Page Size"
                  labelDisplayedRows={() => ``}
                  rowsPerPageOptions={[100, 200]}
                  slotProps={{
                    actions: {
                      previousButton: {
                        disabled: previousToken.length >= 1 ? false : true,
                        onClick: () => {
                          if (pageNumber > 0 && previousToken.length > 0) {
                            setPageNumber(pageNumber - 1);
                            if (previousToken.length == 1) {
                              setPreviousToken([]);
                              setPageToken("");
                              return;
                            }
                            const token = getPreviousToken();
                            setPageToken(token);
                          }
                        },
                      },
                      nextButton: {
                        disabled:
                          histories && histories.nextPageToken.length > 0
                            ? false
                            : true,
                        onClick: () => {
                          if (histories && histories.nextPageToken.length > 0) {
                            const token = histories.nextPageToken;
                            setPageNumber(pageNumber + 1);
                            setPageToken(token);
                            handPreviousToken(token);
                          }
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Container>
      </LocalizationProvider>

      {/* Loading Dialog */}
      <LoadingDialog open={isAnyLoading} message={getLoadingMessage()} />

      {success && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      )}
      {error && showSnackbar && (
        <Snackbar
          open={!!error}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={5000}
          onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}

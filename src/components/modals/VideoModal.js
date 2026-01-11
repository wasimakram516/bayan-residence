"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Paper,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

export default function VideoModal({ open, onClose, media = [] }) {
  /* =========================
     FILTER VIDEOS FROM CMS
  ========================= */
  const videos = useMemo(() => {
    if (!Array.isArray(media)) return [];
    return media.filter((m) => m.type === "video" && m.fileUrl);
  }, [media]);

  const [currentIndex, setCurrentIndex] = useState(0);

  /* =========================
     RESET ON OPEN (IMPORTANT)
  ========================= */
  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? videos.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === videos.length - 1 ? 0 : prev + 1
    );
  };

  if (!open || videos.length === 0) return null;

  const currentVideo = videos[currentIndex];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          maxWidth: 1200,
          mt: "5%",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
        },
      }}
    >
      {/* Floating label */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: -20,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "maroon",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 4,
          py: 0.5,
          borderRadius: "6px",
          zIndex: 10,
        }}
      >
        <PlayCircleFilledIcon fontSize="small" />
        <Typography variant="subtitle1">
          Video {videos.length > 1 && `${currentIndex + 1} / ${videos.length}`}
        </Typography>
      </Paper>

      {/* Close */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.85)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)", color: "#fff" },
        }}
      >
        <CloseIcon color="error" />
      </IconButton>

      <DialogContent
        dividers
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <video
            key={currentVideo.fileUrl}
            src={currentVideo.fileUrl}
            autoPlay
            controls
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
              borderRadius: 8,
              background: "#000",
            }}
          />

          {videos.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.45)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.45)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

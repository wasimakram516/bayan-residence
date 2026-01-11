"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography,
  Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.2;

export default function BrochureModal({ open, onClose, brochure }) {
  const pages = brochure?.pages ?? [];
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================
     ZOOM CONTROLS
  ========================= */
  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));

  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));

  const resetZoom = () => setZoom(1);

  const handleWheel = (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.deltaY < 0 ? zoomIn() : zoomOut();
  };

  const handleDoubleClick = () => {
    setZoom((z) => (z === 1 ? 2 : 1));
  };

  /* =========================
     PAGE TRACKING
  ========================= */
  useEffect(() => {
    if (!containerRef.current) return;

    const onScroll = () => {
      const images = containerRef.current.querySelectorAll("img");
      let visibleIndex = 0;

      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          visibleIndex = index;
        }
      });

      setCurrentPage(visibleIndex + 1);
    };

    const el = containerRef.current;
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "90vh",
          mt: "5%",
          mx: "auto",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
        },
      }}
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
    >
      {/* Floating Title */}
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
          zIndex: 1200,
        }}
      >
        <MenuBookIcon fontSize="small" />
        <Typography variant="subtitle1">Brochure</Typography>
      </Paper>

      {/* Close */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "error.main",
          zIndex: 1200,
          bgcolor: "rgba(255,255,255,0.85)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)", color: "#fff" },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* CONTENT */}
      <DialogContent
        ref={containerRef}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        sx={{
          height: "100%",
          overflowY: "auto",
          px: 2,
          py: 4,
          cursor: zoom > 1 ? "zoom-out" : "zoom-in",
        }}
      >
        {pages.length === 0 ? (
          <Typography align="center" mt={4}>
            No brochure available.
          </Typography>
        ) : (
          <Box
            sx={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            {pages.map((src, index) => (
              <Box
                key={index}
                sx={{
                  mb: 4,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={src}
                  alt={`Page ${index + 1}`}
                  draggable={false}
                  loading="lazy"
                  style={{
                    width: "100%",
                    maxWidth: 900,
                    borderRadius: 8,
                    background: "#f5f5f5",
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      {/* FLOATING ZOOM + PAGE BAR */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.5,
          borderRadius: "999px",
          bgcolor: "rgba(0,0,0,0.85)",
          color: "white",
          zIndex: 1300,
        }}
      >
        <Typography variant="body2" sx={{ minWidth: 90 }}>
          Page {currentPage} / {pages.length}
        </Typography>

        <IconButton
          size="small"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          sx={{ color: "white" }}
        >
          <RemoveIcon />
        </IconButton>

        <IconButton size="small" onClick={resetZoom} sx={{ color: "white" }}>
          <ZoomOutMapIcon />
        </IconButton>

        <IconButton
          size="small"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          sx={{ color: "white" }}
        >
          <AddIcon />
        </IconButton>
      </Paper>
    </Dialog>
  );
}

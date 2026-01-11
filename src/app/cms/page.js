"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  LinearProgress,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRouter } from "next/navigation";

export default function CmsPage() {
  const router = useRouter();

  /* =========================
     FILE STATE
  ========================= */
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  /* =========================
     UPLOAD STATE (SEPARATE)
  ========================= */
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const [imageProgress, setImageProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);

  /* =========================
     CONFIG
  ========================= */
  const [config, setConfig] = useState(null);
  const [location, setLocation] = useState("");
  const [signupLink, setSignupLink] = useState("");

  /* =========================
     DIALOGS
  ========================= */
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* =========================
     LOAD CONFIG
  ========================= */
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d.config);
        setLocation(d.config?.location || "");
        setSignupLink(d.config?.signupLink || "");
      });
  }, []);

  /* =========================
     AWS HELPERS
  ========================= */
  const getPresignedUrl = async (file) => {
    const res = await fetch("/api/kiosk/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presign: true,
        fileName: file.name,
        fileType: file.type,
      }),
    });
    return res.json();
  };

  const uploadToS3 = (file, uploadURL, setProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadURL, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject());
      xhr.onerror = reject;
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

  /* =========================
     UPLOAD HANDLER
  ========================= */
  const uploadMedia = async (files, type) => {
    if (!files || files.length === 0) return;

    const setUploading =
      type === "image"
        ? setImageUploading
        : type === "video"
        ? setVideoUploading
        : setPdfUploading;

    const setProgress =
      type === "image"
        ? setImageProgress
        : type === "video"
        ? setVideoProgress
        : setPdfProgress;

    try {
      setUploading(true);

      for (const file of files) {
        setProgress(0);
        const { uploadURL, key, fileUrl } = await getPresignedUrl(file);

        await uploadToS3(file, uploadURL, setProgress);

        const res = await fetch("/api/kiosk/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            fileName: file.name,
            s3Key: key,
            fileUrl,
          }),
        });

        const data = await res.json();
        setConfig(data.config);
      }

      setSnackbar({
        open: true,
        message: `${type.toUpperCase()} uploaded successfully`,
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: `${type.toUpperCase()} upload failed`,
        severity: "error",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      setImageFiles([]);
      setVideoFile(null);
      setPdfFile(null);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async () => {
    const res = await fetch(`/api/kiosk/media/${selectedMedia._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setConfig(data.config);
    setConfirmDeleteOpen(false);
    setSelectedMedia(null);
  };

  /* =========================
     SAVE CONFIG
  ========================= */
  const saveConfig = async (payload, msg) => {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setConfig(data.config);
    setSnackbar({ open: true, message: msg, severity: "success" });
  };

  /* =========================
     UI
  ========================= */
  return (
    <Box sx={{ p: 4, bgcolor: "#f4f6f8", color:"#333", minHeight: "100vh" }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          CMS Dashboard
        </Typography>
        <IconButton onClick={() => setLogoutOpen(true)}>
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* IMAGES */}
      <MediaSection
        title="Images"
        note="Multiple images allowed"
        multiple
        accept="image/*"
        files={imageFiles}
        setFiles={setImageFiles}
        uploading={imageUploading}
        progress={imageProgress}
        onUpload={() => uploadMedia(imageFiles, "image")}
        items={config?.media?.filter((m) => m.type === "image")}
        onDelete={(m) => {
          setSelectedMedia(m);
          setConfirmDeleteOpen(true);
        }}
        image
      />

      {/* VIDEO */}
      <MediaSection
        title="Video"
        note="Uploading a new video replaces the existing one"
        accept="video/*"
        files={videoFile ? [videoFile] : []}
        setFiles={(f) => setVideoFile(f[0])}
        uploading={videoUploading}
        progress={videoProgress}
        onUpload={() => uploadMedia([videoFile], "video")}
        items={config?.media?.filter((m) => m.type === "video")}
        onDelete={(m) => {
          setSelectedMedia(m);
          setConfirmDeleteOpen(true);
        }}
        video
      />

      {/* PDF */}
      <MediaSection
        title="PDF"
        note="Uploading a new PDF replaces the existing one"
        accept="application/pdf"
        files={pdfFile ? [pdfFile] : []}
        setFiles={(f) => setPdfFile(f[0])}
        uploading={pdfUploading}
        progress={pdfProgress}
        onUpload={() => uploadMedia([pdfFile], "pdf")}
        items={config?.media?.filter((m) => m.type === "pdf")}
        onDelete={(m) => {
          setSelectedMedia(m);
          setConfirmDeleteOpen(true);
        }}
        pdf
      />

      {/* LOCATION */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Google Maps Location</Typography>
        <TextField
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => saveConfig({ location }, "Location updated")}
        >
          Save
        </Button>
      </Paper>

      {/* SIGNUP */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Signup Link</Typography>
        <TextField
          fullWidth
          value={signupLink}
          onChange={(e) => setSignupLink(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => saveConfig({ signupLink }, "Signup link updated")}
        >
          Save
        </Button>
      </Paper>

      {/* DELETE DIALOG */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteIcon color="error" />
          Delete Media
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            This action will permanently delete the selected media file.
            <br />
            This cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* LOGOUT DIALOG */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LogoutIcon color="action" />
          Confirm Logout
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            You will be logged out of the CMS and redirected to the login page.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Stay Logged In
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
            onClick={() => {
              sessionStorage.removeItem("authToken");
              router.replace("/");
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

/* =========================
   MEDIA SECTION COMPONENT
========================= */
function MediaSection({
  title,
  note,
  multiple,
  accept,
  files,
  setFiles,
  uploading,
  progress,
  onUpload,
  items = [],
  onDelete,
  image,
  video,
  pdf,
}) {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>

      <Box mt={2}>
        <Button component="label" startIcon={<UploadFileIcon />}>
          Select File
          <input
            hidden
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={(e) => setFiles(e.target.files)}
          />
        </Button>
        <Button
          sx={{ ml: 2 }}
          variant="contained"
          disabled={uploading || files.length === 0}
          onClick={onUpload}
        >
          Upload
        </Button>
      </Box>

      {uploading && (
        <Box mt={2}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">{progress}%</Typography>
        </Box>
      )}

      <Grid container spacing={2} mt={2}>
        {items.map((m) => (
          <Grid item xs={6} sm={4} md={3} key={m._id}>
            <Paper sx={{ p: 1, position: "relative" }}>
              {image && (
                <img
                  src={m.fileUrl}
                  style={{ width: "100%", height: 120, objectFit: "cover" }}
                />
              )}
              {video && (
                <video src={m.fileUrl} controls style={{ width: "100%", maxWidth:"400px" }} />
              )}
              {pdf && <Typography noWrap>{m.fileName}</Typography>}
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 4, right: 4 }}
                onClick={() => onDelete(m)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

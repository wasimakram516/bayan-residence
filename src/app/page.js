"use client";

import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);

  const handleBackgroundClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
    router.push("/menu");
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/homeBg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -2,
        }}
      />

      {/* White Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.3)",
          zIndex: -1,
        }}
      />

      {/* Clickable overlay (everything except footer) */}
      <Box
        onClick={handleBackgroundClick}
        sx={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Logo */}
        <Box
          sx={{
            position: "absolute",
            top: "2%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: 4,
            borderRadius: "20px",
            bgcolor: "#fff",
          }}
        >
          <img
            src="/logo.png"
            alt="Bayan Logo"
            style={{ width: "25vw", borderRadius: "16px" }}
          />
        </Box>

        {/* Tap Here */}
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img
            src="/TapHere.png"
            alt="Tap Here"
            style={{
              width: "70vw",
              animation: clicked
                ? "pulse 0.4s ease"
                : "breathing 2s ease-in-out infinite",
            }}
          />
        </Box>

        {/* Finger GIF */}
        <Box
          sx={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img
            src="/FingerGif.gif"
            alt="Finger Tap"
            style={{ width: "80vw" }}
          />
        </Box>
      </Box>

      {/* Footer Logo */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          cursor: "pointer",
        }}
      >
        <img
          src="/WWDSLogo.png"
          alt="WhiteWall Logo"
          style={{ width: "50vw", objectFit: "contain" }}
        />
      </Box>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes breathing {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
  );
}

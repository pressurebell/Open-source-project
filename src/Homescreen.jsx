import { Button, Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";


export default function Homescreen() {
  const navigate = useNavigate();

  return (
    <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#FFDAB9",
    backgroundImage: `url("/pictures/earth.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: '"Orbitron", sans-serif',
  }}
>
  <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif', fontSize: "90px" ,color:'white',marginBottom:'20px' }}>
   Game Productivity Tracker
  </Typography>
  <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif', fontSize: "20px",color:'white' }}>
  "Boost Your Productivity: Master Gaming Session Tracking Like a Pro!"
  </Typography>
  <Button
    variant="outlined"
    color="success"
    sx={{ marginTop: "10px", padding: "20px", borderRadius: "10px" }}
    endIcon={<ArrowForwardIcon />}
    onClick={() => navigate("/game")}
  >
    Get Started!
  </Button>
</Box>
  
  );
}

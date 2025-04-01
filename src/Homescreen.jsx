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
    fontFamily: "Raleway, sans-serif",
  }}
>
  <Typography variant="h4" gutterBottom sx={{ fontFamily: "Raleway, sans-serif", fontSize: "3rem" ,color:'white',marginBottom:'20px' }}>
    Welcome to Game Productivity Tracker
  </Typography>
  <Typography variant="h6" gutterBottom sx={{ fontFamily: "Raleway, sans-serif", fontSize: "1.5rem",color:'white' }}>
    Track your gaming sessions and improve your productivity.
  </Typography>
  <Button
    variant="outlined"
    color="primary"
    sx={{ marginTop: "10px", padding: "20px", borderRadius: "10px" }}
    endIcon={<ArrowForwardIcon />}
    onClick={() => navigate("/game")}
  >
    Get Started!
  </Button>
</Box>
  
  );
}

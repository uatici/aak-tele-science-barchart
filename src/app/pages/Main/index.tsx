import {
  Alert,
  AppBar,
  FormControlLabel,
  FormGroup,
  Snackbar,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import { BarChart } from "../../components/BarChart";
import { useCallback, useEffect, useState } from "react";
import { IData } from "../../types/dataTypes";

export function MainPage() {
  const [data, setData] = useState<IData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [useStaticData, setUseStaticData] = useState<boolean>(false);

  const staticData: IData[] = [
    {
      "2023": [
        {
          "05": [
            {
              "2023/05/01 , 00:00:00": 750,
            },
            {
              "2023/05/02 , 00:00:00": 800,
            },
            {
              "2023/05/03 , 00:00:00": 850,
            },
          ],
        },
        {
          "06": [
            {
              "2023/06/01 , 00:00:00": 900,
            },
            {
              "2023/06/02 , 00:00:00": 950,
            },
            {
              "2023/06/03 , 00:00:00": 1000,
            },
          ],
        },
      ],
    },
    {
      "2021": [
        {
          "01": [
            {
              "2021/01/01 , 00:00:00": 100,
            },
            {
              "2021/01/02 , 00:00:00": 200,
            },
            {
              "2021/01/03 , 00:00:00": 150,
            },
          ],
        },
        {
          "02": [
            {
              "2021/02/01 , 00:00:00": 300,
            },
            {
              "2021/02/02 , 00:00:00": 400,
            },
            {
              "2021/02/03 , 00:00:00": 350,
            },
          ],
        },
      ],
    },
    {
      "2024": [
        {
          "07": [
            {
              "2024/07/01 , 00:00:00": 1050,
            },
            {
              "2024/07/02 , 00:00:00": 1100,
            },
            {
              "2024/07/03 , 00:00:00": 1150,
            },
          ],
        },
        {
          "08": [
            {
              "2024/08/01 , 00:00:00": 1200,
            },
            {
              "2024/08/02 , 00:00:00": 1250,
            },
            {
              "2024/08/03 , 00:00:00": 1300,
            },
          ],
        },
      ],
    },
    {
      "2022": [
        {
          "03": [
            {
              "2022/03/01 , 00:00:00": 450,
            },
            {
              "2022/03/02 , 00:00:00": 500,
            },
            {
              "2022/03/03 , 00:00:00": 550,
            },
          ],
        },
        {
          "04": [
            {
              "2022/04/01 , 00:00:00": 600,
            },
            {
              "2022/04/02 , 00:00:00": 650,
            },
            {
              "2022/04/03 , 00:00:00": 700,
            },
          ],
        },
      ],
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      if (useStaticData) {
        setData(staticData);
      } else {
        const response = await fetch(
          "https://django-dev.aakscience.com/candidate_test/fronted"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: IData[] = await response.json();
        setData(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error occurred while fetching data");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useStaticData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUseStaticDataChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseStaticData(event.target.checked);
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setError("");
  };

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </div>
      )}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h6" component="div">
            AAK TELE-SCIENCE BAR CHART
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 12 }} offset={{ xs: 10, md: 10 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={useStaticData}
                  onChange={handleUseStaticDataChange}
                />
              }
              label="Use Static Data"
            />
          </FormGroup>
        </Grid>
        <Grid
          size={{ xs: 12, md: 12 }}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4 }}
        >
          <BarChart data={data}></BarChart>
        </Grid>
      </Grid>
      <Snackbar
        open={error !== ""}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

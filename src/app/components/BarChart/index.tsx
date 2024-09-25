import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { IData, IFlattenedData } from "../../types/dataTypes";

interface BarChartProps {
  data: IData[];
}

export const BarChart = ({ data }: BarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [dateLevel, setDateLevel] = useState<string>("day");

  const colorCache = useMemo(() => ({} as { [key: string]: string }), []);

  const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getColor = useCallback(
    (date: string): string => {
      let key = date;
      if (dateLevel === "day") {
        key = date.slice(0, 7);
      } else if (dateLevel === "month") {
        key = date.slice(0, 4);
      } else if (dateLevel === "year") {
        key = date.slice(0, 4);
      }

      if (!colorCache[key]) {
        colorCache[key] = getRandomColor();
      }
      return colorCache[key];
    },
    [dateLevel, colorCache]
  );

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const flattenedData = flattenData(data, dateLevel);
        const dates = flattenedData.map((item) => item.date);
        const values = flattenedData.map((item) => item.value);
        const colors = flattenedData.map((item) => getColor(item.date));

        chartInstanceRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Sales",
                data: values,
                backgroundColor: colors,
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Sales Data",
              },
            },
            scales: {
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 45,
                  font: {
                    size: 10,
                  },
                },
              },
              y: {
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
            },
            onClick: (e, activeEls) => {
              const chart = chartInstanceRef.current;
              if (chart && activeEls.length > 0) {
                const index = activeEls[0].index;
                const label = chart.data.labels
                  ? (chart.data.labels[index] as string)
                  : "";
                console.log(label);
                console.log(dateLevel);
                if (dateLevel === "year") {
                  data.filter((yearData) =>
                    Object.keys(yearData).includes(label)
                  );
                }
              }
            },
          },
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, dateLevel, getColor]);

  const flattenData = (data: IData[], level: string): IFlattenedData[] => {
    const flattened: IFlattenedData[] = [];

    data.forEach((yearData) => {
      Object.entries(yearData).forEach(([year, months]) => {
        if (level === "year") {
          const yearTotal = months.reduce((yearSum, monthData) => {
            return (
              yearSum +
              Object.values(monthData)
                .flat()
                .reduce((monthSum, days) => {
                  return (
                    monthSum +
                    Object.values(days).reduce((daySum, val) => daySum + val, 0)
                  );
                }, 0)
            );
          }, 0);
          flattened.push({ date: year, value: yearTotal });
        } else {
          months.forEach((monthData) => {
            Object.entries(monthData).forEach(([month, days]) => {
              if (level === "month") {
                const monthTotal = days.reduce((monthSum, day) => {
                  return (
                    monthSum +
                    Object.entries(day).reduce(
                      (daySum, [_, val]) => daySum + val,
                      0
                    )
                  );
                }, 0);
                flattened.push({ date: `${year}-${month}`, value: monthTotal });
              } else {
                days.forEach((day) => {
                  Object.entries(day).forEach(([date, value]) => {
                    flattened.push({
                      date: date.split(" , ")[0],
                      value: value,
                    });
                  });
                });
              }
            });
          });
        }
      });
    });

    flattened.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return flattened;
  };

  const handleDateLevelChange = (event: SelectChangeEvent) => {
    setDateLevel(event.target.value);
  };

  return (
    <Grid
      size={{ xs: 6, md: 6 }}
      container
      spacing={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 4 }}
    >
      <Grid
        size={{ xs: 12, md: 12 }}
        display="flex"
        justifyContent="begin"
        alignItems="center"
      >
        <Select value={dateLevel} onChange={handleDateLevelChange}>
          <MenuItem value={"year"}>Year</MenuItem>
          <MenuItem value={"month"}>Month</MenuItem>
          <MenuItem value={"day"}>Day</MenuItem>
        </Select>
      </Grid>
      <Grid
        size={{ xs: 12, md: 12 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 4 }}
      >
        <canvas ref={chartRef} />
      </Grid>
    </Grid>
  );
};

import React from "react";
// import ReactDOM from "react-dom";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import {
  elderRay,
  ema,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CurrentCoordinate,

  CandlestickSeries,
  ElderRaySeries,
  LineSeries,

  OHLCTooltip,
  lastVisibleItemBasedZoomAnchor,
  XAxis,
  YAxis,
  StraightLine,
  MouseCoordinateX,
  MouseCoordinateY,

  // withDeviceRatio,
  // withSize
} from "react-financial-charts";
import { initialData } from "./data";
import { createRoot } from 'react-dom/client';
// import { element } from "prop-types";
import './styles.css';
import reportWebVitals from './reportWebVitals';

const App = () => {
  const ScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d) => new Date(d.date)
  );
  const height = 700;
  const width = 900;
  const margin = { left: 0, right: 48, top: 0, bottom: 24 };

  const ema12 = ema()
    .id(1)
    .options({ windowSize: 12 })
    .merge((d, c) => {
      d.ema12 = c;
    })
    .accessor((d) => d.ema12);

  const ema26 = ema()
    .id(2)
    .options({ windowSize: 26 })
    .merge((d, c) => {
      d.ema26 = c;
    })
    .accessor((d) => d.ema26);

  const elder = elderRay();

  // const calculatedData = elder(ema26(ema12(initialData)));
  const { data, xScale, xAccessor, displayXAccessor } = ScaleProvider(
    initialData
  );
  // console.log(data.length)
  let i = 0;
  let j = 0;
  let k = 0;
  let today = 0;
  let month = 0;
  let year = 0;
  let week = 0;
  data.forEach(element => {
    const dateParts = element.date.split(" ")[0].split("-"); // Split the date string by space and then by hyphen

    const each_year = parseInt(dateParts[0]); // Extract the year
    // const each_month = parseInt(dateParts[1]); // Extract the month
    const each_day = parseInt(dateParts[2]); // Extract the day

    if (new Date().getFullYear().toString() === each_year.toString()) {
      year += element.open; // Add the 'open' value to the total if the 'date' matches today

      if ((new Date().getMonth() + 1).toString() === `${new Date(element.date).getMonth() + 1}`) {
        j += 1;
        month += element.open; // Add the 'open' value to the total if the 'date' matches today
        if (new Date().getDate().toString() === each_day.toString()) {
          i += 1;
          today += element.open; // Add the 'open' value to the total if the 'date' matches today
        }

        const currentDate = new Date();

        // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const currentDay = currentDate.getDay();

        // Calculate the date of the first day of the week (Sunday)
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(currentDate.getDate() - currentDay);

        // Calculate the date of the last day of the week (Saturday)
        const lastDayOfWeek = new Date(currentDate);
        lastDayOfWeek.setDate(currentDate.getDate() + (6 - currentDay));

        // Check if the current date falls within the current week
        if (new Date(element.date) >= firstDayOfWeek && new Date(element.date) <= lastDayOfWeek) {
          k += 1;
          week += element.open;
        } else {
          // console.log('The current date is not within the current week.');
        }


      }
    }
  });
  const fixed_year = (year / data.length).toFixed(2);
  const fixed_month = (month / j).toFixed(2);
  const fixed_today = (today / i).toFixed(2);
  const fixed_week = (week / k).toFixed(2);
  console.log(fixed_week)
  console.log(fixed_month)
  console.log(fixed_year)
  console.log(fixed_today)
  const pricesDisplayFormat = format(".2f");
  const max = xAccessor(data[data.length - 1]);
  const min = xAccessor(data[Math.max(0, data.length - 100)]);
  const xExtents = [min, max + 5];
  const gridHeight = height - margin.top - margin.bottom;
  const elderRayHeight = 100;
  const elderRayOrigin = (_, h) => [0, h - elderRayHeight];
  const chartHeight = gridHeight - elderRayHeight;
  const dateTimeFormat = "%d %b";
  const timeDisplayFormat = timeFormat(dateTimeFormat);
  const candleChartExtents = (data) => {
    return [data.high, data.low];
  };
  const tickValues = [fixed_week, fixed_year, fixed_today, fixed_month]; // Specify the numbers you want to display on the y-axis

  return (
    <>
      <div className="centerlayout">
        <div style={{ display: 'inline' }}>
          <div className="centerlayout" style={{ marginTop: '30px' }}>
            <div>
              <ChartCanvas
                height={height}
                ratio={3}
                width={width}
                margin={margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
                zoomAnchor={lastVisibleItemBasedZoomAnchor}
              >

                <Chart id={3} height={chartHeight} yExtents={candleChartExtents}>
                  <XAxis showGridLines showTickLabel={false} />
                  {/* <YAxis showGridLines tickFormat={pricesDisplayFormat} /> */}
                  <CandlestickSeries />
                  <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()} />
                  <CurrentCoordinate
                    yAccessor={ema26.accessor()}
                    fillStyle={ema26.stroke()}
                  />
                  <YAxis
                    showGridLines
                    tickFormat={d => d}
                    tickValues={tickValues}

                  />

                  <StraightLine
                    yValue={fixed_year} // Y value at which the line will be parallel to the y-axis
                    stroke="red" // Color of the line
                    lineWidth={2} // Width of the line
                    strokeStyle={'blue'}

                  />
                  <StraightLine
                    yValue={fixed_month} // Y value at which the line will be parallel to the y-axis
                    stroke="red" // Color of the line
                    lineWidth={2} // Width of the line
                    strokeStyle={'red'}

                  />
                  <StraightLine
                    yValue={fixed_today}
                    stroke="red"
                    lineWidth={2}
                    strokeStyle={'green'}
                  />
                  <StraightLine
                    yValue={fixed_week} // Y value at which the line will be parallel to the y-axis
                    stroke="red" // Color of the line
                    lineWidth={2} // Width of the line
                    strokeStyle={'brown'}

                  />

                  <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />
                  <CurrentCoordinate
                    yAccessor={ema12.accessor()}
                    fillStyle={ema12.stroke()}
                  />
                  <MouseCoordinateY
                    rectWidth={margin.right}
                    displayFormat={pricesDisplayFormat}
                  />


                  <OHLCTooltip origin={[8, 16]} />
                </Chart>


                <Chart
                  id={4}
                  height={elderRayHeight}
                  yExtents={[0, elder.accessor()]}
                  origin={elderRayOrigin}
                  padding={{ top: 8, bottom: 8 }}
                >
                  {/* <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" /> */}
                  <YAxis ticks={4} tickFormat={pricesDisplayFormat} />

                  <MouseCoordinateX displayFormat={timeDisplayFormat} />
                  <MouseCoordinateY
                    rectWidth={margin.right}
                    displayFormat={pricesDisplayFormat}
                  />

                  <ElderRaySeries yAccessor={elder.accessor()} />



                </Chart>
              </ChartCanvas>
            </div>
          </div>
        </div>
        <div className='linecolor' >
          <div className="monthlinecolor" >
            <div className="lineletter">M</div>
          </div>
          <div className="yearlinecolor">
            <div className="lineletter">Y</div>
          </div>
          <div className="daylinecolor">
            <div className="lineletter">D</div>
          </div>
          <div className="weeklinecolor">
            <div className="lineletter">W</div>
          </div>
        </div>
      </div>
      <div className="centerlayout">
        <h2>Daily Weekly Monthly Yearly Opens</h2>
      </div>
    </>
  );

};
const root = createRoot(document.getElementById('root'));
root.render(<App />);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
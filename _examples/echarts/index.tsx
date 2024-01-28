/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import * as echarts from "echarts";

const container = document.getElementById("root");
const chart = echarts.init(container);

let base = +new Date(1968, 9, 3);
const oneDay = 24 * 3600 * 1000;
const date = [];
const data = [Math.random() * 300];
for (let i = 1; i < 20000; i++) {
  const now = new Date(base += oneDay);
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"));
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}

chart.setOption({
  tooltip: {
    trigger: "axis",
    position: function (pt: unknown[]) {
      return [pt[0], "10%"];
    },
  },
  title: {
    left: "center",
    text: "Area Chart",
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: "none",
      },
      restore: {},
      saveAsImage: {},
    },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: date,
  },
  yAxis: {
    type: "value",
    boundaryGap: [0, "100%"],
  },
  dataZoom: [
    {
      type: "inside",
      start: 0,
      end: 10,
    },
    {
      start: 0,
      end: 10,
    },
  ],
  series: [
    {
      name: "Fake Data",
      type: "line",
      symbol: "none",
      sampling: "lttb",
      itemStyle: {
        color: "rgb(255, 70, 131)",
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgb(255, 158, 68)",
          },
          {
            offset: 1,
            color: "rgb(255, 70, 131)",
          },
        ]),
      },
      data: data,
    },
  ],
});

/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

const log = (...msg) => {
  console.log('|Chart|', ...msg);
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

console.log('ChartJS registered');

function Chart({ data, className, triggerScrollIntoView }) {
  log('data', data);
  log('triggerScrollIntoView', triggerScrollIntoView);

  return (
    <div className={className}>
      <Line
        data={data.chartData}
        options={data.chartOptions}
      />
    </div>
  );
}

Chart.propTypes = {
  data: PropTypes.shape({
    chartData: PropTypes.any,
    chartOptions: PropTypes.any
  }).isRequired,
  className: PropTypes.string.isRequired,
  triggerScrollIntoView: PropTypes.func.isRequired,
};

export default styled(Chart)`
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.2);
  overflow: hidden;

  background: #393939;
  color: #FFF;
`;

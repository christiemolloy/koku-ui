import { css } from '@patternfly/react-styles';
import { Report } from 'api/reports';
import {
  ChartLegend,
  ChartLegendItem,
  ChartTitle,
} from 'components/commonChart';
import {
  ChartDatum,
  ChartType,
  getTooltipLabel,
  transformReport,
} from 'components/commonChart/chartUtils';
import React from 'react';
import { FormatOptions, ValueFormatter } from 'utils/formatValue';
import {
  VictoryArea,
  VictoryGroup,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';
import { chartStyles, styles } from './trendChart.styles';

interface TrendChartProps {
  title: string;
  height: number;
  current: Report;
  previous: Report;
  type: ChartType;
  formatDatumValue: ValueFormatter;
  formatDatumOptions?: FormatOptions;
}

interface State {
  width: number;
}

class TrendChart extends React.Component<TrendChartProps, State> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state: State = {
    width: 0,
  };

  public shouldComponentUpdate(nextProps: TrendChartProps) {
    if (!nextProps.current || !nextProps.previous) {
      return false;
    }
    return true;
  }

  private getTooltipLabel = (datum: ChartDatum) => {
    const { formatDatumValue, formatDatumOptions } = this.props;
    const label = getTooltipLabel(
      datum,
      formatDatumValue,
      formatDatumOptions,
      'date'
    );
    return label;
  };

  private handleResize = () => {
    this.setState({ width: this.containerRef.current.clientWidth });
  };

  public componentDidMount() {
    setTimeout(() => {
      this.setState({ width: this.containerRef.current.clientWidth });
      window.addEventListener('resize', this.handleResize);
    });
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  public render() {
    const { title, current, previous, height, type } = this.props;

    const currentData = transformReport(current, type);
    const previousData = transformReport(previous, type);

    return (
      <div className={css(styles.reportSummaryTrend)} ref={this.containerRef}>
        <VictoryGroup
          padding={chartStyles.padding}
          style={chartStyles.group}
          height={height}
          width={this.state.width}
          domainPadding={{ y: [0, 8] }}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              title={title}
              responsive={false}
              labels={this.getTooltipLabel}
              labelComponent={
                <VictoryTooltip
                  cornerRadius={0}
                  style={chartStyles.tooltipText}
                  flyoutStyle={chartStyles.tooltipFlyout}
                />
              }
            />
          }
        >
          {Boolean(previousData.length) && (
            <VictoryArea
              style={chartStyles.previousMonth}
              data={previousData}
            />
          )}
          {Boolean(currentData.length) && (
            <VictoryArea style={chartStyles.currentMonth} data={currentData} />
          )}
        </VictoryGroup>
        <ChartTitle>{title}</ChartTitle>
        <ChartLegend>
          <ChartLegendItem isCurrent data={currentData} />
          <ChartLegendItem data={previousData} />
        </ChartLegend>
      </div>
    );
  }
}

export { TrendChart, TrendChartProps };

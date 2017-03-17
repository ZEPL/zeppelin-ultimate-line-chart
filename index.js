import Visualization from 'zeppelin-vis'
import AdvancedTransformation from 'zeppelin-tabledata/advanced-transformation'

import 'amcharts3'
import 'amcharts3/amcharts/serial'
import 'amcharts3/amcharts/themes/light'

// TOOD: After ZEPPELIN-2088
// import 'amcharts3-export'
// import 'amcharts3-export/export.css'

const CommonParameter = {
  'dateFormat': { valueType: 'string', defaultValue: '', description: 'format of date (<a href="https://docs.amcharts.com/3/javascriptcharts/AmGraph#dateFormat">doc</a>) (e.g YYYY-MM-DD)', },
  'graphType': { valueType: 'string', defaultValue: 'line', description: 'graph type', widget: 'option', optionValues: [ 'line', 'smoothedLine', 'step', ], },
  'bulletType': { valueType: 'string', defaultValue: 'round', description: 'type of bullet', widget: 'option', optionValues: [ 'round', 'round-white', 'none', ], },
  'balloonType': { valueType: 'string', defaultValue: 'simple', description: 'type of balloon', widget: 'option', optionValues: [ 'simple', 'color', 'drop-shaped', ], },
  'inverted': { valueType: 'boolean', defaultValue: false, description: 'invert x and y axes', widget: 'checkbox', },
  'logarithmicYAxis': { valueType: 'boolean', defaultValue: false, description: 'use logarithmic scale in yAxis', widget: 'checkbox', },
  'rotateXAxisLabel': { valueType: 'string', defaultValue: 'none', description: 'rotate xAxis labels', widget: 'option', optionValues: [ 'none', '+90', '-90', ], },
  'xAxisPosition': { valueType: 'string', defaultValue: 'bottom', description: 'xAxis position', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'xAxisName': { valueType: 'string', defaultValue: '', description: 'name of xAxis', },
  'xAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of xAxis', },
  'yAxisPosition': { valueType: 'string', defaultValue: 'left', description: 'yAxis position', widget: 'option', optionValues: [ 'left', 'right', ], },
  'yAxisName': { valueType: 'string', defaultValue: '', description: 'name of yAxis', },
  'yAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of yAxis', },
  'balloonText': { valueType: 'string', defaultValue: '', description: 'text format of balloon (<a href="https://docs.amcharts.com/3/javascriptcharts/AmGraph#balloonText">doc</a>)', },
  'legendValueText': { valueType: 'string', defaultValue: '', description: 'text format of legend (<a href="https://docs.amcharts.com/3/javascriptcharts/AmGraph#legendValueText">doc</a>)', },
  'dashLength': { valueType: 'int', defaultValue: 0, description: 'the length of dash', },
  'noStepRisers': { valueType: 'boolean', defaultValue: false, description: 'no risers in step line', widget: 'checkbox', },
  'hideBulletsCount': { valueType: 'int', defaultValue: 50, description: 'bullets will be shown until this count', },
  'yAxisGuides': { valueType: 'JSON', defaultValue: '', description: 'guides of yAxis (<a href="https://docs.amcharts.com/3/javascriptcharts/ValueAxis#guides">doc</a>) (<a href="https://www.amcharts.com/demos/logarithmic-scale/">example</a>)', widget: 'textarea', },
  'trendLines': { valueType: 'JSON', defaultValue: '', description: 'trend lines (<a href="https://docs.amcharts.com/3/javascriptcharts/TrendLine">doc</a>) (<a href="https://www.amcharts.com/demos/trend-lines/">example</a>)', widget: 'textarea', },
}

export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    const spec = {
      charts: {
        'basic': {
          /** default transform.method is flatten cube */
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator'},
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        },

        'no-group': {
          transform: { method: 'raw', },
          axis: {
            'xAxis': { dimension: 'single', axisType: 'unique', },
            'yAxis': { dimension: 'multiple', axisType: 'value'},
          },
          parameter: CommonParameter,
        },

      },
    }

    this.spec = spec
    this.transformation = new AdvancedTransformation(config, spec)
  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.clear() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  drawBasicChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, keyColumnName, groupNameSet, } = transformer()
    const chartOption = createCommonChartOption(rows, parameter, keyColumnName, groupNameSet)

    this.clearChart()
    this.chartInstance = AmCharts.makeChart(this.getChartElementId(), chartOption)
  }

  drawNoGroupChart(parameter, column, transformer) {
    const uniqueKeyColumns = column.custom['unique']
    const valueColumns = column.custom['value']

    if (!valueColumns || valueColumns.length === 0 ||
      !uniqueKeyColumns || uniqueKeyColumns.length !== 1) {
      this.hideChart()
      return /** have nothing to display */
    }

    const keyColumn = uniqueKeyColumns[0]

    const rows = transformer()
    const data = createNoGroupChartData(rows, keyColumn, valueColumns)
    const groupNameSet = new Set(valueColumns.map(c => c.name))
    const chartOption = createCommonChartOption(data, parameter, keyColumn.name, groupNameSet)

    this.clearChart()
    this.chartInstance = AmCharts.makeChart(this.getChartElementId(), chartOption)
  }

  render(data) {
    const { chart, parameter, column, transformer, } = data

    if (chart === 'basic') {
      this.drawBasicChart(parameter, column, transformer)
    } else if (chart === 'no-group') {
      this.drawNoGroupChart(parameter, column, transformer)
    }
  }

  getTransformation() {
    return this.transformation
  }
}

export function createBasicChartGraphs(parameter, groupNameSet) {

  let {
    xAxisUnit, yAxisUnit, graphType, dashLength, noStepRisers,
    bulletType, hideBulletsCount, balloonType, balloonText, legendValueText,
  } = parameter

  let counter = 1
  const graphs = []

  let defaultBalloonText = `[[title]]: <b>[[value]]</b> ${yAxisUnit}`
  let defaultLegendValueText = (yAxisUnit) ? `[[value]] ${yAxisUnit}` : '[[value]]'

  for (let groupName of groupNameSet) {
    const g = {
      id: `g${counter}`,
      type: graphType,
      dashLength: dashLength,
      noStepRisers: noStepRisers,
      title: groupName,
      valueField: groupName,
      bulletSize: 5,
      hideBulletsCount,
      lineThickness: 2,
      balloonText: defaultBalloonText,
      legendValueText: defaultLegendValueText,
    }

    if (bulletType === 'round') {
      g.bullet = 'round'
    } else if (bulletType === 'round-white') {
      g.bullet = 'round'
      g.bulletBorderAlpha = 1
      g.bulletColor = '#FFFFFF'
      g.useLineColorForBulletBorder = true
    }

    if (balloonType === 'color') {
      g.balloon = { adjustBorderColor: false, color: '#ffffff' }
    } else if (balloonType === 'drop-shaped') {
      g.balloon = { adjustBorderColor: false, color: '#ffffff', drop: true, }
      defaultBalloonText = '[[value]]'
    }

    if (balloonText.trim()) { defaultBalloonText = balloonText }
    if (legendValueText.trim()) { defaultLegendValueText = legendValueText }

    g.balloonText = defaultBalloonText
    g.legendValueText = defaultLegendValueText

    graphs.push(g)

    counter = counter + 1
  }

  return graphs
}

export function createCommonChartOption(data, parameter, keyColumnName, groupNameSet) {
  const {
    dateFormat,
    inverted, logarithmicYAxis, rotateXAxisLabel,
    balloonType,
    xAxisPosition, yAxisPosition,
    yAxisGuides, trendLines,
    xAxisName, yAxisName,
  } = parameter

  const graphs = createBasicChartGraphs(parameter, groupNameSet)

  const option = {
    path: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.21.0/',
    type: 'serial',
    theme: 'light',
    rotate: inverted,
    marginRight: 10,
    marginLeft: 10,
    autoMarginOffset: 20,
    dataDateFormat: (dateFormat) ? dateFormat : undefined,
    categoryField: keyColumnName,
    categoryAxis: {
      parseDates: (dateFormat), dashLength: 1, minorGridEnabled: true,
      title: (xAxisName) ? xAxisName : undefined,
      position: xAxisPosition,
      labelRotation: (rotateXAxisLabel === 'none') ? 0 : (rotateXAxisLabel === '+90') ? 90 : -90,
    },
    trendLines: (Array.isArray(trendLines)) ? trendLines : [],
    valueAxes: [{
      id: 'v1', axisAlpha: 0, ignoreAxisWidth: true,
      title: (yAxisName !== '') ? yAxisName : undefined,
      position: yAxisPosition,
      guides: (Array.isArray(yAxisGuides)) ? yAxisGuides : [],
      logarithmic: logarithmicYAxis,
    }],
    graphs: graphs,
    balloon: { borderThickness: 0.8, shadowAlpha: 0 },
    legend: { align: 'center', equalWidths: false, },
    valueScrollbar: {
      oppositeAxis: false, offset: 50, scrollbarHeight: 10,
      backgroundAlpha: 0.15,
      backgroundColor: '#868686',
      selectedBackgroundAlpha: 0.3,
      selectedBackgroundColor: '#757586',
    },
    chartCursor: {
      valueLineEnabled: true,
      valueLineBalloonEnabled: true,
      cursorAlpha: 1,
      cursorColor: '#258cbb',
      valueLineAlpha: 0.2,
      zoomable: true,
      valueZoomable: false,
    },
    export: { enabled: true },
    dataProvider: data,
  }

  if (balloonType === 'drop-shaped') { option.balloon.borderThickness = 0.3 }

  return option
}

export function createNoGroupChartData(rows, keyColumn, otherColumns) {
  const refinedRows = []

  for(let i = 0; i < rows.length; i++) {
    const row = rows[i]

    const refined = { [keyColumn.name]: row[keyColumn.index], }

    for(let j = 0; j < otherColumns.length; j++) {
      const col = otherColumns[j]
      refined[col.name] = row[col.index]
    }

    refinedRows.push(refined)
  }

  return refinedRows
}



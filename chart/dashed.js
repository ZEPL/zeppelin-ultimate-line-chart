
import {
  CommonParameter,
  createCommonChartGraphs,
  createCommonChartOption,
} from './common'

const p = JSON.parse(JSON.stringify(CommonParameter))
p.graphType = { valueType: 'string', defaultValue: 'line', description: 'graph type', widget: 'option', optionValues: [ 'smoothedLine', 'line', ], }
p.dashLength = { valueType: 'int', defaultValue: 5, description: 'the length of dash', }
p.bulletType = { valueType: 'string', defaultValue: 'none', description: 'type of bullet', widget: 'option', optionValues: [ 'none', 'round', 'round-white', ], }
export const DashedLineParameter = p

export function createDashedLineGraph(parameter, selectors) {
  const graphs = createCommonChartGraphs(parameter, selectors)
  let { graphType, dashLength, } = parameter

  for(let i = 0; i < graphs.length; i++) {
    const g = graphs[i]

    g.type = graphType
    g.bulletSize = 3
    g.dashLength = dashLength
  }

  return graphs
}

export function createDashedLineChartOption(graphs, data, parameter, keyColumnNames) {
  const option = createCommonChartOption(graphs, data, parameter, keyColumnNames)
  return option
}
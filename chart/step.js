import {
  CommonParameter,
  createCommonChartGraphs,
  createCommonChartOption,
} from './common'

const p = JSON.parse(JSON.stringify(CommonParameter))
delete p.graphType
delete p.bulletType
p.dashLength = { valueType: 'int', defaultValue: 0, description: 'the length of dash', }
p.noStepRisers = { valueType: 'boolean', defaultValue: false, description: 'no risers in step line', widget: 'checkbox', }
export const StepLineParameter = p

export function createStepLineGraph(parameter, selectors) {
  const graphs = createCommonChartGraphs(parameter, selectors)
  let { dashLength, noStepRisers, } = parameter

  for(let i = 0; i < graphs.length; i++) {
    const g = graphs[i]

    g.type = 'step'
    g.noStepRisers = noStepRisers
    g.bulletSize = 3
    g.bulletType = 'none'
    g.dashLength = dashLength
  }

  return graphs
}

export function createStepLineChartOption(graphs, data, parameter, keyColumnNames) {
  const option = createCommonChartOption(graphs, data, parameter, keyColumnNames)
  return option
}

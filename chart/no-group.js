import {
  CommonParameter,
  createCommonChartGraphs,
  createCommonChartOption,
} from './common'

const p = JSON.parse(JSON.stringify(CommonParameter))
p.graphType = { valueType: 'string', defaultValue: 'line', description: 'graph type', widget: 'option', optionValues: [ 'smoothedLine', 'line', 'step', ], }
p.dashLength = { valueType: 'int', defaultValue: 5, description: 'the length of dash', }
p.dashLength = { valueType: 'int', defaultValue: 0, description: 'the length of dash', }
p.noStepRisers = { valueType: 'boolean', defaultValue: false, description: 'no risers in step line', widget: 'checkbox', }
export const NoGroupParameter = p

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
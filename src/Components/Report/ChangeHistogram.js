import React from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, Tooltip, Legend } from "recharts";

export class CustomTooltip extends React.Component {
	render() {
		const { active } = this.props;

		if (active) {
			const { payload, label } = this.props;
			console.log(payload, payload.payload, payload.relationCount);
			return (
				<div className="tooltip">
					<div className="label">
						{payload[0].payload.filesHavingThisRelationCount} pairs of files changed together {payload[0].payload.relationCount} times.
					</div>
					<div className="desc">These relationships account for {payload[0].payload.percentageOfData}% of the data in the model.</div>
				</div>
			);
		}

		return null;
	}
}

export class ChangeHistogram extends React.Component {
	state = {};
	render() {
		console.log(this.props.data);
		return (
			<BarChart width={600} height={300} data={this.props.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="relationCount" />
				<YAxis />
				<Tooltip content={<CustomTooltip />} />
				<Legend />
				<Bar dataKey="filesHavingThisRelationCount" fill="#8884d8" />
			</BarChart>
		);
	}
}

export default ChangeHistogram;

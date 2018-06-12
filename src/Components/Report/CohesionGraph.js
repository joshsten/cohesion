import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import React from "react";

const mode = {
	TWO_DIMENSIONAL: 0,
	THREE_DIMENSIONAL: 1
};

export class CohesionGraph extends React.Component {
	state = { renderMode: mode.TWO_DIMENSIONAL };
	render() {
		let graph = null;
		if (this.state.renderMode == mode.TWO_DIMENSIONAL) {
			graph = (
				<ForceGraph2D
					graphData={this.props.data}
					nodeLabel="name"
					nodeAutoColorBy="group"
					linkDirectionalParticles="value"
					linkDirectionalParticleSpeed={d => d.value * 0.0001}
				/>
			);
		} else {
			graph = (
				<ForceGraph3D
					graphData={this.props.data}
					nodeLabel="name"
					nodeAutoColorBy="group"
					linkDirectionalParticles="value"
					linkDirectionalParticleSpeed={d => d.value * 0.001}
				/>
			);
		}

		return (
			<React.Fragment>
				<div className="alert alert-info">Double Click to Zoom</div>
				<button onClick={() => this.setState({ renderMode: mode.TWO_DIMENSIONAL })} class="button">
					2D
				</button>
				<button onClick={() => this.setState({ renderMode: mode.THREE_DIMENSIONAL })} class="button">
					3D
				</button>
				{graph}
			</React.Fragment>
		);
	}
}

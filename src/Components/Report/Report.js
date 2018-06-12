import { createModel } from "../../model";
import { RelatedFiles } from "./RelatedFiles";
import ChangeHistogram from "./ChangeHistogram";
import Skeleton from "react-loading-skeleton";
import fetch from "node-fetch";
import React from "react";
import { FileTable } from "./MostChangedFiles";
import FaListUl from "react-icons/lib/fa/list-ul";
import FaLink from "react-icons/lib/fa/group";
import FaBarChart from "react-icons/lib/fa/bar-chart";
import FaGraph from "react-icons/lib/fa/sitemap";
import { CohesionGraph } from "./CohesionGraph";
//var ProgressBar = require("react-progressbar.js");
//var Circle = ProgressBar.Circle;

const views = {
	MOST_CHANGED_FILES: 0,
	FILES_RELATED_TO: 1,
	ALL_COHESION: 2,
	CHANGE_COUNT_HISTOGRAM: 3,
	COHESION_GRAPH: 4,
	COHESION_FILE_STRUCTURE: 5
};

/*var bar = new ProgressBar.Circle(container, {
	color: "#FFEA82",
	trailColor: "#eee",
	trailWidth: 1,
	duration: 1400,
	easing: "bounce",
	strokeWidth: 6,
	from: { color: "#FFEA82", a: 0 },
	to: { color: "#ED6A5A", a: 1 },
	// Set default step function for all animate calls
	step: function(state, circle) {
		circle.path.setAttribute("stroke", state.color);
	}
});*/

export class Report extends React.Component {
	state = {
		selectedFile: null,
		modelLoaded: false,
		model: null,
		view: views.MOST_CHANGED_FILES
	};
	componentDidMount() {
		fetch("relational-model.json")
			.then(result => result.json())
			.then(result => {
				const model = createModel("", result);
				model.prune(2, [".map", ".csproj", "cpui-react", "package.json", "package-lock.json", ".css", ".scss", ".sqlproj", ".config"]);
				this.setState({
					model: model,
					modelLoaded: true
				});
			});
	}
	render() {
		let viewToRender = null;
		switch (this.state.view) {
			default:
			case views.MOST_CHANGED_FILES:
				if (this.state.modelLoaded) {
					console.log(this.state.model);
					const usages = this.state.model.reporting.getUsages({ top: 20 });
					viewToRender = (
						<React.Fragment>
							<div className="container">
								<div className="row">
									<FileTable
										usages={usages}
										selectFile={file => this.setState({ selectedFile: file, view: views.FILES_RELATED_TO })}
										showGraphFor={file => this.setState({ selectedFile: file, view: views.COHESION_GRAPH })}
									/>
								</div>
							</div>
						</React.Fragment>
					);
				} else {
					return (
						<React.Fragment>
							<h3>Cohesion Initializing...</h3>
							<p className="alert alert-info">
								Cohesion builds a model of change relationships between files from your GIT history. It then provides analytics on the cohesion of
								your files in regard to change. The model file is large and may take a minute or two to load...Please wait.
							</p>
							<Skeleton count={10} />
						</React.Fragment>
					);
				}
				break;
			case views.FILES_RELATED_TO:
				const selectedSplitPath = this.state.selectedFile.split("/");
				const selectedFilename = selectedSplitPath[selectedSplitPath.length - 1];

				viewToRender = (
					<React.Fragment>
						<h4 title={this.state.selectedFile}>{`${selectedSplitPath[selectedSplitPath.length - 2]}/${selectedFilename}`} changes with...</h4>
						<div className="container">
							<div className="row">
								<RelatedFiles
									relatedFiles={this.state.model.reporting.getRelatedForPath(this.state.selectedFile)}
									selectFile={file => this.setState({ selectedFile: file, view: views.FILES_RELATED_TO })}
									showGraphFor={file => this.setState({ selectedFile: file, view: views.COHESION_GRAPH })}
								/>
							</div>
						</div>
					</React.Fragment>
				);
				break;
			case views.ALL_COHESION:
				viewToRender = (
					<React.Fragment>
						<h4>The Most Cohesive File Relationships</h4>
						<div className="container">
							<div className="row">
								<RelatedFiles
									relatedFiles={this.state.model.reporting.getAllCohesiveness({
										top: 50,
										progressCallback: data => console.log(((data.current / data.count) * 100).toFixed(2) + "%", data.current, data.count)
									})}
									selectFile={file => this.setState({ selectedFile: null, view: views.FILES_RELATED_TO })}
									showGraphFor={file => this.setState({ selectedFile: file, view: views.COHESION_GRAPH })}
								/>
							</div>
						</div>
					</React.Fragment>
				);
				break;
			case views.CHANGE_COUNT_HISTOGRAM:
				viewToRender = (
					<React.Fragment>
						<h4>Histogram of Change Counts</h4>
						<p>Can be used to decide how much to prune the model for more efficient reporting.</p>
						<ChangeHistogram data={this.state.model.reporting.getChangeCounts()} />;
					</React.Fragment>
				);
				break;
			case views.COHESION_GRAPH:
				viewToRender = (
					<React.Fragment>
						<h4>Cohesion Graph</h4>
						<CohesionGraph data={this.state.model.reporting.getAsGraph(this.state.selectedFile)} />;
					</React.Fragment>
				);
				break;
		}

		return (
			<React.Fragment>
				<div>
					<header>
						<div className="nav">
							<span className="title">Cohesion</span>
							<a href="#mostchangedfiles" onClick={() => this.setState({ selectedFile: null, view: views.MOST_CHANGED_FILES })} className="nav-item">
								<FaListUl /> Most Changed Files
							</a>
							<a href="#cohesion" onClick={() => this.setState({ selectedFile: null, view: views.ALL_COHESION })} className="nav-item">
								<FaLink />Stength of Cohesion
							</a>
							<a
								href="#changecounthistogram"
								onClick={() => this.setState({ selectedFile: null, view: views.CHANGE_COUNT_HISTOGRAM })}
								className="nav-item"
							>
								<FaBarChart />Change Histogram
							</a>
							<a href="#changecounthistogram" onClick={() => this.setState({ selectedFile: null, view: views.COHESION_GRAPH })} className="nav-item">
								<FaGraph />Cohesion Graph
							</a>
							<a
								href="#changecounthistogram"
								onClick={() => this.setState({ selectedFile: null, view: views.COHESION_FILE_STRUCTURE })}
								disabled
								className="nav-item"
							>
								<FaGraph /> Recommended File Structure
							</a>
						</div>
					</header>
				</div>
				<p className="alert alert-warning">Stength of Cohesion takes a couple minutes to compute!</p>
				{viewToRender}
			</React.Fragment>
		);
	}
}
export default Report;

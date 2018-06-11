import {createModel} from './model'
import { RelatedFiles } from './RelatedFiles';
import Skeleton from 'react-loading-skeleton';
import fetch from 'node-fetch'
import React from 'react';
import {FileTable} from './FileTable'

export class Report extends React.Component {
	state = {selectedFile: null, modelLoaded: false, model: null};
	componentDidMount() {
		fetch("relational-model.json")
		.then (result => result.json())
		.then (result => {
				const model = createModel("",result);
				model.prune(2, [
					".map",
					".csproj",
					"cpui-react",
					"package.json",
					"package-lock.json",
					".css",
					".scss",
					".sqlproj",
					".config"
				]);
				this.setState({
					model: model,
					modelLoaded: true
				})
				}
			);
	}
	render() {
		if (!this.state.selectedFile){
			if (this.state.modelLoaded){
				console.log(this.state.model);
				const usages = this.state.model.reporting.getUsages({top: 20});
				return <FileTable usages={usages}
					selectFile={file => this.setState({selectedFile: file})} />;
			}else{
				return <React.Fragment>
					<i>The model file may take a while to load...</i>
					<Skeleton count={10}/>
				</React.Fragment>;
			}
		}else{
			return <RelatedFiles
				selectedFile={this.state.selectedFile}
				relatedFiles={this.state.model.reporting.getRelatedForPath(this.state.selectedFile)}
				back={file => this.setState({selectedFile: null})}
				selectFile={file => this.setState({selectedFile: file})}
				/>
		}
	}
}
export default Report;
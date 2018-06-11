import React from 'react';
import FaListUl from 'react-icons/lib/fa/list-ul';
import Together from 'react-icons/lib/fa/group';
import Alone from 'react-icons/lib/fa/user-times';
import Cohesion from 'react-icons/lib/fa/arrows-h';

export const RelatedFiles = ({selectedFile, relatedFiles, back, selectFile}) => {
	const selectedSplitPath = selectedFile.split('/');
	const selectedFilename = selectedFile[selectedSplitPath.length - 1];
	return <div>
		<div className="row">
			<div className="columns twelve">
				<button onClick={back} className="button"><FaListUl/>Files Changed</button>
			</div>
		</div>
		<h4 title={selectedFile}>{`${selectedFile[selectedSplitPath.length - 2]}/${selectedFilename}`} changes with...</h4>
		<table>
			<colgroup>
				<col span="1" style={{width: '70%'}}/>
				<col span="1" style={{width: '10%'}}/>
				<col span="1" style={{width: '10%'}}/>
				<col span="1" style={{width: '10%'}}/>
			</colgroup>
			<thead>
				<tr>
					<th title="A file that changes with me.">Filename</th>
					<th title="Cohesion - when I change how often the file changes with me."><Cohesion/></th>
					<th title="how many times the file changed with me."><Together/></th>
					<th title="how many times the file changed without me."><Alone/></th>
				</tr>
			</thead>
			<tbody>
				{relatedFiles.map(file => {
					const splitPath = file.filenameThatAlsoChanged.split('/');
					const filename = splitPath[splitPath.length - 1];
				return <tr
					key={file.filenameThatAlsoChanged}
					title={
						`When I change, ${filename} changes with me ${file.percentCohesiveByChange}% of the time (${file.timesChangedWith} times). It's changed on it's own without me ${file.timesDidNotChangeWith} times.`}
					>
					<td onClick={() => selectFile(file.filenameThatAlsoChanged)}>
						<div title={file.filenameThatAlsoChanged} style={{
							width: '500px',
							cursor: 'pointer',
							textAlign: 'left',
							background: `linear-gradient(90deg, lightsteelblue ${file.percentCohesiveByChange}%, #FFF 0%)`
							}}>
							{`${splitPath[splitPath.length - 2]}/${filename}`}
						</div>
					</td>
					<td>{file.percentCohesiveByChange}%</td>
					<td>{file.timesChangedWith}</td>
					<td>{file.timesDidNotChangeWith}</td>
				</tr>;
			})}
			</tbody>
		</table>
	</div>;
}

export default RelatedFiles;
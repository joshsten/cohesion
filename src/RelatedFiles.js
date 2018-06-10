import React from 'react';
import FaListUl from 'react-icons/lib/fa/list-ul';
export const RelatedFiles = ({selectedFile, relatedFiles, back}) => {
	return <div>
		<div className="row">
			<div className="columns twelve">
				<button onClick={back} className="button"><FaListUl/>Files Changed</button>
			</div>
		</div>
		<h4>{selectedFile} changes with...</h4>
		<table>
			<colgroup>
				<col span="1" style={{width: '70%'}}/>
				<col span="1" style={{width: '10%'}}/>
				<col span="1" style={{width: '10%'}}/>
				<col span="1" style={{width: '10%'}}/>
			</colgroup>
			<thead>
				<tr>
					<th>Filename</th>
					<th>Cohesion</th>
					<th>Times Changed With</th>
					<th>Times Changed Without</th>
				</tr>
			</thead>
			<tbody>
				{relatedFiles.map(file => <tr key={file.filenameThatAlsoChanged}>
					<td>
						<div style={{
							width: '500px',
							textAlign: 'left',
							background: `linear-gradient(90deg, lightsteelblue ${file.percentCohesiveByChange}%, #FFF 0%)`
							}}>
							{file.filenameThatAlsoChanged}
						</div>
					</td>
					<td>{file.percentCohesiveByChange}%</td>
					<td>{file.timesChangedWith}</td>
					<td>{file.timesDidNotChangeWith}</td>
				</tr>)}

			</tbody>
		</table>
	</div>;
}

export default RelatedFiles;
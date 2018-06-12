import React from "react";
import Together from "react-icons/lib/fa/group";
import Alone from "react-icons/lib/fa/user-times";
import Cohesion from "react-icons/lib/fa/arrows-h";
import FaGraph from "react-icons/lib/fa/sitemap";

export const RelatedFiles = ({ relatedFiles, selectFile, showGraphFor }) => {
	return (
		<div>
			<table>
				<colgroup>
					<col span="1" style={{ width: "65%" }} />
					<col span="1" style={{ width: "10%" }} />
					<col span="1" style={{ width: "10%" }} />
					<col span="1" style={{ width: "10%" }} />
					<col span="1" style={{ width: "5%" }} />
				</colgroup>
				<thead>
					<tr>
						<th title="A file that changes with me.">Filename</th>
						<th title="Cohesion - when I change how often the file changes with me.">
							<Cohesion />
						</th>
						<th title="how many times the file changed with me.">
							<Together />
						</th>
						<th title="how many times the file changed without me.">
							<Alone />
						</th>
						<th title="how many times the file changed without me." />
					</tr>
				</thead>
				<tbody>
					{relatedFiles.map(file => {
						const splitPath = file.filenameThatAlsoChanged.split("/");
						const filename = splitPath[splitPath.length - 1];

						const fromFileSplit = file.fromFile ? file.fromFile.split("/") : null;
						const fromFilename = file.fromFile ? fromFileSplit[fromFileSplit.length - 1] : null;

						return (
							<tr
								key={file.filenameThatAlsoChanged}
								title={`When I change, ${filename} changes with me ${file.percentCohesiveByChange}% of the time (${
									file.timesChangedWith
								} times). It's changed on it's own without me ${file.timesDidNotChangeWith} times.`}
							>
								<td onClick={() => selectFile(file.filenameThatAlsoChanged)}>
									<div
										title={file.filenameThatAlsoChanged}
										style={{
											width: "500px",
											cursor: "pointer",
											textAlign: "left",
											background: `linear-gradient(90deg, lightsteelblue ${file.percentCohesiveByChange}%, #FFF 0%)`
										}}
									>
										{file.fromFile ? `${fromFileSplit[fromFileSplit.length - 2]}/${fromFilename} -> ` : null}
										{`${splitPath[splitPath.length - 2]}/${filename}`}
									</div>
								</td>
								<td>{file.percentCohesiveByChange}%</td>
								<td>{file.timesChangedWith}</td>
								<td>{file.timesDidNotChangeWith}</td>
								<td>
									<button onClick={showGraphFor(file.filenameThatAlsoChanged)} className="button">
										<FaGraph />
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default RelatedFiles;

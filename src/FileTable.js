import React from 'react';

export const FileTable = ({usages, selectFile}) => {
		return <React.Fragment>
					<div className="row">
						<div className="twelve columns">
							<h2>Most Changed Files</h2>
						</div>
						<table className="u-full-width">
							<thead>
								<tr>
									<th >Filename</th>
									<th>#</th>
									<th>% of total</th>
								</tr>
							</thead>
							<tbody>
								{usages.map(usage => <tr key={usage.file}>
										<td style={{cursor: 'pointer'}}  onClick={() => selectFile(usage.file)}>
											<div style={{textAlign: 'left', background: `linear-gradient(90deg, lightsteelblue ${usage.percent}%, #FFF 0%)`}}>
												{usage.file}
											</div>
										</td>
										<td style={{textAlign: 'right'}}>{usage.changeCount}</td>
										<td style={{textAlign: 'right'}}>{usage.percent}%</td>
									</tr>)}
							</tbody>
						</table>
					</div>
				</React.Fragment>;
}

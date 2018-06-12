const fs = fs || {};
export function createModel(rootDirectory = "", initialModel = {}) {
	const model = initialModel;
	model.data = model.data || {};

	model.update = function(setOfRelations) {
		const filteredSetOfRelations = setOfRelations
			.filter(relation => !model.ignorePatterns.some(pattern => relation.indexOf(pattern) > -1))
			.map(relation => relation.toLowerCase().replace(rootDirectory.toLowerCase(), ""));
		filteredSetOfRelations.forEach(xElement => {
			const data = model.data;
			filteredSetOfRelations.forEach(yElement => {
				data[xElement] = data[xElement] || {};
				data[xElement][yElement] = data[xElement][yElement] || { ref: 0 };
				data[xElement][yElement].ref += 1;
			});
			try {
				if (data[xElement]) {
					const yKeys = Object.keys(data[xElement]);
					yKeys.filter(yKey => !filteredSetOfRelations.includes(yKey)).forEach(yKey => {
						data[xElement][yKey].unref = data[xElement][yKey].unref || 0;
						data[xElement][yKey].unref += 1;
					});
				}
			} catch (ex) {
				console.log("Exception: " + ex);
			}
		});
	};

	model.prune = (relationThresholdForInclusion = 2, ignorePatterns = []) => {
		console.log("Beginning pruning.....");

		let pruneCount = 0;
		let xKeys = Object.keys(model.data);
		xKeys.forEach(xKey => {
			const yKeys = Object.keys(model.data[xKey]);
			if (ignorePatterns.some(pattern => (getNameFromIndex(xKey) || "").indexOf(pattern) > -1)) {
				delete model.data[xKey];
				pruneCount++;
				return;
			}
			yKeys.forEach(yKey => {
				if (
					model.data[xKey][yKey].ref < relationThresholdForInclusion
					//	|| ignorePatterns.some(pattern => (getNameFromIndex(yKey) || "").indexOf(pattern) > -1)
				) {
					delete model.data[xKey][yKey];
					pruneCount++;
				}
			});
		});
		xKeys = Object.keys(model.data);
		xKeys.forEach(xKey => {
			const yKeys = Object.keys(model.data[xKey]);
			if (!yKeys.length) {
				delete model.data[xKey];
				pruneCount++;
			}
		});

		console.log("Pruning complete. " + pruneCount + " keys removed for not having " + relationThresholdForInclusion + " relations or more.");
	};

	model.optimize = () => {
		console.log("Optimizing model by building an index...");
		model.index = {};
		let xKeys = Object.keys(model.data);
		let index = 0;
		xKeys.forEach(xKey => {
			model.index[xKey] = index;
			model.data[index] = model.data[xKey];
			delete model.data[xKey];
			index++;
		});
		xKeys = Object.keys(model.data);
		xKeys.forEach(xKey => {
			const yKeys = Object.keys(model.data[xKey]);
			yKeys.forEach(yKey => {
				if (!model.index[yKey]) {
					model.index[yKey] = index;
					index++;
				}
				model.data[xKey][model.index[yKey]] = model.data[xKey][yKey];
				delete model.data[xKey][yKey];
				index++;
			});
		});
		console.log("Model Optimization Complete..");
	};

	model.persist = () => {
		console.log("Writing model file...");
		fs.writeFile("D:/svn/Cohesion/cohesion/relational-model.json", JSON.stringify({ index: model.index, data: model.data }));
		console.log("Finished writing model file.");
	};

	model.load = fileName => {
		console.log("Reading model file...");
		const data = JSON.parse(fs.readFileSync("D:/svn/Cohesion/cohesion/relational-model.json"));
		model.index = data.index;
		model.data = data.data;
		console.log("Finished reading model file.");
	};

	const getNameFromIndex = function(index) {
		return Object.keys(model.index).find(name => model.index[name] === parseInt(index));
	};
	const getSimplePath = function(path) {
		if (!path) return path;
		const split = path.split("/");
		return `${split[split.length - 2]}/${split[split.length - 1]}`;
	};

	model.reporting = {
		getUsages: options => {
			const files = Object.keys(model.index);
			const index = model.index;
			const data = model.data;
			let totalUsageCount = 0;
			let usages = files
				.map(file => {
					const fileId = index[file];
					const relations = data[fileId] && data[fileId][fileId];
					totalUsageCount += (relations && relations.ref) || 0;
					return relations ? { file, changeCount: relations.ref } : { file, changeCount: 0, xCount: 0 };
				})
				.map(relations => {
					relations.percent = ((relations.changeCount / totalUsageCount) * 100).toFixed(2);
					return relations;
				});
			usages.sort((a, b) => a.changeCount - b.changeCount).reverse();

			if (options.top) {
				usages = usages.slice(0, options.top);
			}

			return usages;
		},
		getRelatedForPath: (path, options = { sort: true }) => {
			const files = Object.keys(model.index);
			const index = model.index;
			const data = model.data;
			const normalizedPath = path.toLowerCase().replace(rootDirectory, "");
			const matchingFile = files.find(file => file.indexOf(normalizedPath) > -1);
			const fileId = model.index[matchingFile];
			if (fileId && data[fileId]) {
				const relationData = data[fileId];
				const relations = Object.keys(relationData);
				const numberOfTimesChanged = (data[fileId][fileId] && data[fileId][fileId].ref) || 1;
				console.log("Matched " + matchingFile + " that has been changed " + numberOfTimesChanged + " times.");

				let formattedRelations = relations.map(relation => ({
					filenameThatAlsoChanged: getNameFromIndex(relation),
					percentCohesiveByChange: ((relationData[relation].ref / numberOfTimesChanged) * 100).toFixed(2),
					timesChangedWith: relationData[relation].ref,
					timesDidNotChangeWith: relationData[relation].unref
				}));
				if (options.sort) {
					formattedRelations.sort((a, b) => a.percentCohesiveByChange - b.percentCohesiveByChange).reverse();
				}

				return formattedRelations;
			} else {
				console.log("Unable to find data on " + path);
			}
		},
		getAllCohesiveness: ({ top, progressCallback }) => {
			// get most cohesive relationships
			const files = Object.keys(model.index);
			let cohesionList = [];
			let index = 0;
			const fileCount = files.length;
			files.forEach(file => {
				index++;
				const relations = model.reporting.getRelatedForPath(file, { sort: false });
				if (relations) {
					cohesionList.push.apply(
						cohesionList,
						relations.map(relations => {
							relations.fromFile = file;
							return relations;
						})
					);
				}
				progressCallback && progressCallback({ current: index, count: fileCount });
			});
			debugger;
			cohesionList = cohesionList.filter(item => item.fromFile !== item.file); // filter out self references
			cohesionList.sort((a, b) => a.percentCohesiveByChange - b.percentCohesiveByChange).reverse();
			if (top) {
				cohesionList = cohesionList.slice(0, top);
			}
			return cohesionList;
		},
		getChangeCounts: () => {
			const histogramCounts = {};
			const xKeys = Object.keys(model.data);
			let totalCount = 0;
			xKeys.forEach(xKey => {
				const yKeys = Object.keys(model.data[xKey]);
				yKeys.forEach(yKey => {
					if (model.data[xKey][yKey]) {
						histogramCounts[model.data[xKey][yKey].ref] = histogramCounts[model.data[xKey][yKey].ref] || 0;
						histogramCounts[model.data[xKey][yKey].ref]++;
						totalCount++;
					}
				});
			});

			const countsAsArray = Object.keys(histogramCounts).map(relationCount => ({
				relationCount: relationCount,
				filesHavingThisRelationCount: histogramCounts[relationCount],
				percentageOfData: ((histogramCounts[relationCount] / totalCount) * 100).toFixed(2)
			}));
			countsAsArray.sort((a, b) => a.relationCount - b.relationCount);

			return countsAsArray;
		},
		getAsGraph: selectedFile => {
			const inverseIndex = {};
			Object.keys(model.index).forEach(key => (inverseIndex[model.index[key]] = key));
			const selectedFileIndex = model.index[selectedFile];
			const nodes = Object.keys(model.index).map(filename => ({
				id: model.index[filename],
				name: getSimplePath(filename),
				desc: filename,
				group: filename.split(".").pop()
			}));
			const links = Object.keys(model.data)
				.filter(key => !selectedFileIndex || key === selectedFileIndex)
				.map(xKey =>
					Object.keys(model.data[xKey]).map(yKey => {
						return {
							source: xKey,
							target: yKey,
							name: `${xKey} changed with ${yKey} ${model.data[xKey][yKey].ref} times and without ${model.data[xKey][yKey].unref} times.`,
							value: model.data[xKey][yKey].ref
						};
					})
				)
				.reduce((a, b) => a.concat(b))
				.slice(0, 1000);
			nodes.push({ id: "0", name: "unknown" }); // TODO: 0 index is missing probably because of bad filter with 0 being false....
			return { nodes, links };
		}
	};

	return model;
}

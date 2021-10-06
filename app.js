const axios = require('axios');
const cheerio = require('cheerio');

async function fetchData(url, method = 'GET', cookies = '') {
	const response = await axios({
		url: url,
		method: method,
		headers: {
			Cookie: cookies,
		},
	});

	if (response.status !== 200) {
		throw new Error(`Error: to fetch data, status: ${response.status}`);
	}

	return response.data;
}

function getFundCodeFromArgument() {
	if (process.argv.length < 3) {
		throw new Error(`Error: Required one argument for 'FundCode.'`);
	}
	return process.argv[2];
}

function getDataFromTableRow($, row, tag = 'td') {
	const columns = $(row).find(tag);
	const data = [];
	for (let index = 0; index < columns.length; index++) {
		data.push($(columns[index]).text().trim());
	}

	return data;
}

function getColumnIndex(colNames, name) {
	const colIndex = colNames.findIndex((colName) => {
		return colName === name;
	});

	if (colIndex < 0) {
		throw new Error(`Error: Cannot find column: ${name}`);
	}

	return colIndex;
}

async function getNavData() {
	const url = 'https://codequiz.azurewebsites.net/';
	const method = 'GET';
	const cookies = 'hasCookie=true;';

	const FUNDCODE = getFundCodeFromArgument();
	const NavColName = 'Nav';
	const FundCodeColName = 'Fund Name';
	// -----------------------------------------------
	const htmlText = await fetchData(url, method, cookies);
	const $ = cheerio.load(htmlText);
	const rows = $('tr');

	if (rows.length < 2) {
		throw new Error('Error: Got invalid html data.');
	}

	const colNames = getDataFromTableRow($, rows[0], 'th');
	const NavColIndex = getColumnIndex(colNames, NavColName);
	const FundCodeColIndex = getColumnIndex(colNames, FundCodeColName);

	for (let index = 1; index < rows.length; index++) {
		const row = rows[index];
		const colData = getDataFromTableRow($, row);
		const fundName = colData[FundCodeColIndex];

		if (FUNDCODE === fundName) {
			const Nav = colData[NavColIndex];
			return `NAV of "${FUNDCODE}" = ${Nav}`;
		}
	}

	throw new Error(`Error: Cannot find Nav of "${FUNDCODE}".`);
}

getNavData()
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.log(err.message);
	});

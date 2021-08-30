import { useState } from 'react'
import InputField from '../common/InputField.jsx'
import InputSelect from '../common/InputSelect.jsx'

const Row = ({data}) => {
	return <details className='row w-100 px-0 mx-0' style={{position: 'relative'}}>
		<summary> {data.title} </summary>
		{Object.keys(data).map((item, index) => {
			return <div className='col-12'>
				<InputField disabled={true} label={item} getter={data[item]} />
			</div>
		})}
		<hr />
	</details>
}

const CSVParser = () => {

	const [csv, setCSV] = useState();

	const readCSVData = (data) => {
		if (!data) {
			return;
		}

		const reader = new FileReader();

		reader.onload = function (e) {
			const text = e.target.result.split('\r\n');
			let final = [];
			let headers = text.splice(0, 1)[0].split(',');
			text.map((textItem, textIndex) => {
				let insert = {};
				headers.forEach((headerItem, headerIndex) => {
					insert[headerItem] = textItem.split(',')[headerIndex]
				})
				console.log(insert);
				final.push(insert);
			})

			setCSV(final);
		};

		reader.readAsText(data);
	}

	return <>
		<input type='file' accept='.csv' onChange={e => readCSVData(e.target.files[0])}/>
		{csv && csv.map(item => <Row data={item} />)}
	</>;
}

export default CSVParser;
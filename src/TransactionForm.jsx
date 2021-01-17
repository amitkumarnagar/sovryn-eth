import { useState } from 'react';

const TransferForm = ({
	accountBalance,
	myAccount,
	onTransactionSubmitted,
}) => {
	const [receiverAddress, setReceiverAddress] = useState('');
	const [amount, setAmount] = useState('');
	const [transactionHash, setTransactionHash] = useState('');
	const [transactionStatus, setTransactionStatus] = useState();

	const handleSendingAmount = e => {
		const { value } = e.target;
		setAmount(value);
	};

	const onTransfer = () => {
		if (receiverAddress && amount && amount < accountBalance) {
			window.contract.methods
				.transfer(myAccount, Number(amount))
				.send({ from: myAccount }, (e, r) => {
					console.log('Transfer error => ', e);
					console.log('Transfer result => ', r);
					setAmount('');
					setReceiverAddress('');
					setTransactionHash(r);
					onTransactionSubmitted(r);
					setTransactionStatus('pending');
				})
				.on('transactionHash', function (hash) {
					console.log('transaction hash ', hash);
					setTransactionHash(hash);
					onTransactionSubmitted(hash);
				})
				.on('confirmation', function (confirmationNumber, receipt) {
					console.log('transaction confirm ', confirmationNumber, receipt);
					onTransactionSubmitted(transactionHash);
					confirmationNumber && setTransactionStatus('completed');
				})
				.on('receipt', function (receipt) {
					console.log('transaction receipt ', receipt);
					onTransactionSubmitted(transactionHash);
				})
				.on('error', function (error, receipt) {
					console.log('transaction error ', error, receipt);
					onTransactionSubmitted(transactionHash);
					setTransactionStatus('failed.');
				});
		}
	};

	return (
		<div className="transaction-form">
			<div className="input-container">
				<input
					placeholder="Receiver's address"
					value={receiverAddress}
					onChange={e => setReceiverAddress(e.target.value)}
				/>
			</div>
			<div className="input-container">
				<input
					placeholder="Amount"
					value={amount}
					onChange={handleSendingAmount}
				/>
			</div>
			<div className="input-container">
				<button
					className="btn"
					onClick={onTransfer}
					disabled={!(amount && receiverAddress)}
				>
					Submit
				</button>
			</div>
			{!!transactionHash && (
				<h5>
					Transaction Hash:{' '}
					<a
						href={`https://ropsten.etherscan.io/tx/${transactionHash}`}
						target="_blank"
						rel="noreferrer"
					>
						{transactionHash}
					</a>
				</h5>
			)}
			{!!transactionStatus && <h5>Transaction Status: {transactionStatus}</h5>}
		</div>
	);
};

export default TransferForm;

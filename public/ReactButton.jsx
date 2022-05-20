const ReactButton = () => {
  console.log(`react triggered`)
  return <span><button>React</button></span>
}

ReactDOM.render(<ReactButton />, document.querySelector('#btn-react'));
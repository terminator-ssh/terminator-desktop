

const TerminalPage = () => {

  const connection = { id: 1, name: 'Example Connection Name', host: '0.0.0.0', port: '22', user: 'username' };

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-200 mb-2">
        {connection.name} 
        <span className="text-gray-500 text-lg font-normal">  | {connection.user}@{connection.host}</span>
      </h1>
   
      <div className="flex items-center justify-center h-full text-gray-500">Terminal Placeholder</div>
    </div>
  );
};

export default TerminalPage

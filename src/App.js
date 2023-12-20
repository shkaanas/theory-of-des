import './styles.scss';
import React, { useState } from 'react';
import { Stack, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import Matrix from './components/Matrix';

function App() {
  const [showTable, setShowTable] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  function onlyNum() {
    if (x > 1 && y > 1) setShowTable(true);
  }

  return (
    <div className="main">
      {showTable ? (
        <div className="card">
          <Matrix x={x} y={y} />
        </div>
      ) : (
        <div className="card">
          <Stack spacing={3}>
            <InputGroup>
              <InputLeftAddon children="X" />
              <Input
                type="number"
                min={1}
                max={20}
                placeholder="Кількість x ..."
                onChange={(e) => setX(+e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon children="Y" />
              <Input
                type="number"
                min={1}
                max={20}
                placeholder="Кількість y ..."
                onChange={(e) => setY(+e.target.value)}
              />
            </InputGroup>
            <Button
              onClick={onlyNum}
              colorScheme="teal"
              variant="solid"
            >
              Показати таблицю
            </Button>
          </Stack>
        </div>
      )}
    </div>
  );
}

export default App;

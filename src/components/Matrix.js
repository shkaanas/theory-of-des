import React, { useEffect, useState } from 'react';
import { Input, Heading, Text, Stack } from '@chakra-ui/react';
import { InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import { Table, Tbody, Tr, Td, TableContainer } from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

function Matrix({ x, y }) {
  const [step, setStep] = useState(0.01);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const [value, setValue] = useState(0);
  const handleChange = (value) => setValue(value);

  const [matrix, setMatrix] = useState(() => {
    const initialMatrix = Array.from({ length: x }, () =>
      Array(y).fill(Number.NEGATIVE_INFINITY)
    );
    return initialMatrix;
  });

  // Обробник події для зміни значення у комірці матриці
  const handleCellChange = (rowIndex, colIndex, newValue) => {
    setMatrix((prevMatrix) => {
      const newMatrix = [...prevMatrix];
      newMatrix[rowIndex][colIndex] = newValue;
      return newMatrix;
    });
  };

  // Функція для обчислення максимакса для кожного рядка
  const calculateMaximax = () => {
    const maximaxes = matrix.map((row) => Math.max(...row));
    const overallMaximax = Math.max(...maximaxes);
    const overallMin = Math.min(...maximaxes);
    return { maximaxes, overallMaximax, overallMin };
  };

  const { maximaxes, overallMaximax, overallMin } = calculateMaximax();

  // Функція для обчислення мінімакса для кожного рядка
  const calculateMinimax = () => {
    const minimaxes = matrix.map((row) => Math.min(...row));
    const overallMinimax = Math.max(...minimaxes);
    return { minimaxes, overallMinimax };
  };

  const { minimaxes, overallMinimax } = calculateMinimax();

  // Функція для обчислення критерію Гурвіца для кожного рядка
  const calculateHurwicz = () => {
    const hurwiczes = matrix.map((row) => {
      const minValue = Math.min(...row);
      const maxValue = Math.max(...row);
      return value * maxValue + (1 - value) * minValue;
    });
    const overallHur = Math.max(...hurwiczes);
    return { hurwiczes, overallHur };
  };

  const { hurwiczes, overallHur } = calculateHurwicz();

  //Критерій Севіджа
  // Функція для обчислення найбільшого значення в кожному стовпці
  const calculateColumnMaxValues = () => {
    const columnMaxValues = Array(y).fill(Number.NEGATIVE_INFINITY);

    matrix.forEach((row) => {
      row.forEach((cell, colIndex) => {
        columnMaxValues[colIndex] = Math.max(columnMaxValues[colIndex], cell);
      });
    });

    return columnMaxValues;
  };

  // Функція для створення нової матриці, віднімаючи найбільше значення від кожного елемента
  const createModifiedMatrix = () => {
    const columnMaxValues = calculateColumnMaxValues();
    const modifiedMatrix = matrix.map((row) =>
      row.map((cell, colIndex) => columnMaxValues[colIndex] - cell)
    );

    const sev = modifiedMatrix.map((row) => Math.max(...row));
    const overallSev = Math.min(...sev);
    return { modifiedMatrix, overallSev };
  };

  const { modifiedMatrix, overallSev } = createModifiedMatrix();

  //В умовах ризику
  const [columnValues, setColumnValues] = useState(() =>
    Array(y).fill(Number.NEGATIVE_INFINITY)
  );
  // Обробник події для зміни значення у полі вводу стовпця
  const handleColumnInputChange = (colIndex, newValue) => {
    setError('');
    setColumnValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[colIndex] = newValue;
      return newValues;
    });
  };

  const handleSubmit = () => {
    if (columnValues.some((value) => value === Number.NEGATIVE_INFINITY)) {
      setError('Заповніть всі поля');
      return;
    }
    const sum = columnValues.reduce((acc, value) => acc + parseFloat(value), 0);
    if (sum > 1) {
      setError('Сума значень стовпців не може бути більше 1.');
      setColumnValues(Array(y).fill(Number.NEGATIVE_INFINITY));
      return;
    }
    setShowResult(true);
  };
  const calculateBayes = () => {
    const bayes = matrix.map((row) =>
      row.map((cell, colIndex) => cell * columnValues[colIndex])
    );
    const overallBB = bayes.map((row) =>
      row.reduce((acc, value) => acc + value, 0)
    );
    const overallBayes = Math.max(...overallBB);
    return { bayes, overallBayes, overallBB };
  };

  const { bayes, overallBayes, overallBB } = calculateBayes();

  const calculateDispersion = () => {
    const dispersion = matrix.map((row) =>
      row.map((cell, colIndex) => cell * cell * columnValues[colIndex])
    );
    const overall = dispersion.map((row) =>
      row.reduce((acc, value) => acc + value, 0)
    );


    const overallPow = overall.map(
      (row, rowIndex) => Math.sqrt(row - overallBB[rowIndex] * overallBB[rowIndex]).toFixed(2)
    );
      // console.log(overallPow);
    const overallDispersion = Math.min(...overallPow);
    return { overallPow, overallDispersion };
  };

  const { overallPow, overallDispersion } = calculateDispersion();

  const findMinMaxValues = () => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    matrix.forEach((row) => {
      row.forEach((cell) => {
        min = Math.min(min, cell);
        max = Math.max(max, cell);
      });
    });

    return { min, max };
  };

  const { min, max } = findMinMaxValues();
  const [value2, setValue2] = useState(min);
  const handleChange2 = (value2) => setValue2(value2);

  // Функція для обчислення оцінок за критерієм максимізації ймовірності
  const calculateEstimatedProbabilities = () => {
    const chosenValue = value2;
    const newProbabilities = matrix.map((row) => {
      const rowProbability = row.reduce((acc, value) => {
        if (chosenValue <= value) {
          parseFloat(acc);
          acc += parseFloat(columnValues[row.indexOf(value)]);
        }
        return acc;
      }, 0);
      return rowProbability.toFixed(2);
    });

    const overallProb = Math.max(...newProbabilities);
    return { newProbabilities, overallProb };
  };

  const { newProbabilities, overallProb } = calculateEstimatedProbabilities();

  // Критерій модальний
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnValuesInMatrix, setColumnValuesInMatrix] = useState([]);
  const [modalErr, setModalErr] = useState('');
  const calculateModalCriterion = () => {
    setModalErr('');
    const maxProbability = Math.max(...columnValues);
    const maxProbabilityIndices = columnValues.reduce(
      (indices, value, index) =>
        value == maxProbability ? [...indices, index] : indices,
      []
    );

    if (maxProbabilityIndices.length === 1) {
      const columnIndex = maxProbabilityIndices[0];
      setSelectedColumn(columnIndex);

      const valuesInSelectedColumn = matrix.map((row) => row[columnIndex]);
      setColumnValuesInMatrix(valuesInSelectedColumn);
    } else {
      setModalErr(
        'У даному випадку критерій не може бути застосований'
      );
    }
  };

  useEffect(() => {
    calculateModalCriterion();
  }, [showResult]);

  return (
    <>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>В умовах невизначеності</Tab>
          <Tab>В умовах ризику</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Heading size="xs" my={5} textTransform="uppercase">
              Критерій прийняття рішень в умовах невизначеності
            </Heading>
            <TableContainer>
              <Table variant="simple">
                <Tbody>
                  {matrix.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <Td key={colIndex}>
                          <Input
                            type="number"
                            value={cell}
                            width="70px"
                            variant="filled"
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                colIndex,
                                +e.target.value
                              )
                            }
                          />
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Heading size="xs" my={5} textTransform="uppercase">
              Критерій "максимакса"
            </Heading>
            <div className="card_inner">
              {maximaxes.map((max, index) => (
                <Text pt="2" fontSize="md" key={index}>
                  Z{index + 1}: {max}
                </Text>
              ))}
              <Text pt="2" fontSize="md">
                Максимальне значення: {overallMaximax}
              </Text>
            </div>

            <Heading size="xs" my={5} textTransform="uppercase">
              Мінімаксний критерій
            </Heading>
            <div className="card_inner">
              {minimaxes.map((min, index) => (
                <Text pt="2" fontSize="md" key={index}>
                  Z{index + 1}: {min}
                </Text>
              ))}
              <Text pt="2" fontSize="md">
                Максимум з мінімумів: {overallMinimax}
              </Text>
              {maximaxes.map((max, index) => (
                <Text pt="2" fontSize="md" key={index}>
                  Z{index + 1}: {max}
                </Text>
              ))}
              <Text pt="2" fontSize="md">
                Мінімум з максимусів: {overallMin}
              </Text>
            </div>

            <Heading size="xs" my={5} textTransform="uppercase">
              Критерій Гурвіца
            </Heading>

            <Slider
              flex="1"
              step={step}
              min={0}
              max={1}
              focusThumbOnChange={false}
              value={value}
              onChange={handleChange}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb fontSize="md" boxSize="32px" children={value} />
            </Slider>
            <div className="card_inner">
              {hurwiczes.map((hurwicz, index) => (
                <Text pt="2" fontSize="md" key={index}>
                  Z{index + 1}: {hurwicz}
                </Text>
              ))}
              <Text pt="2" fontSize="md">
                Максимальне значення: {overallHur}
              </Text>
            </div>

            <Heading size="xs" my={5} textTransform="uppercase">
              Критерій Севіджа
            </Heading>
            <div className="card_inner">
              <TableContainer>
                <Table variant="simple">
                  <Tbody>
                    {modifiedMatrix.map((row, rowIndex) => (
                      <Tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <Td key={colIndex}>{cell}</Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <Text pt="2" fontSize="md">
                Мінімальне значення: {overallSev}
              </Text>
            </div>
          </TabPanel>
          <TabPanel>
            <Heading size="xs" my={5} textTransform="uppercase">
              Критерій прийняття рішень в умовах ризику
            </Heading>
            <TableContainer>
              <Table variant="simple">
                <Tbody>
                  {matrix.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <Td key={colIndex}>
                          <Input
                            type="number"
                            value={cell}
                            width="70px"
                            variant="filled"
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                colIndex,
                                +e.target.value
                              )
                            }
                          />
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Heading size="xs" my={5} textTransform="uppercase">
              Введіть імовірності
            </Heading>
            <Stack spacing={3}>
              {columnValues.map((value, colIndex) => (
                <InputGroup key={colIndex}>
                  <InputLeftAddon children={`P${colIndex + 1}`} />

                  <Input
                    type="number"
                    step={step}
                    min={0}
                    max={1}
                    value={value}
                    onChange={(e) =>
                      handleColumnInputChange(colIndex, e.target.value)
                    }
                  />
                </InputGroup>
              ))}
              {error && <Text color="red">{error}</Text>}

              <Button onClick={handleSubmit} colorScheme="teal" variant="solid">
                Підтвердити
              </Button>
            </Stack>
            {showResult && (
              <>
                <Heading size="xs" my={5} textTransform="uppercase">
                  Критерій Байєсса «максимізації прибутку»
                </Heading>
                <div className="card_inner">
                  {bayes.map((row, rowIndex) => (
                    <Text pt="2" fontSize="md" key={rowIndex}>
                      Z{rowIndex + 1}:{' '}
                      {row.reduce((acc, value) => acc + value, 0)}
                    </Text>
                  ))}

                  <Text pt="2" fontSize="md">
                    Максимальне значення: {overallBayes}
                  </Text>
                </div>

                <Heading size="xs" my={5} textTransform="uppercase">
                  Критерій мінімізації дисперсії
                </Heading>

                <div className="card_inner">
                  {overallPow.map((row, rowIndex) => (
                    <Text pt="2" fontSize="md" key={rowIndex}>
                      Z{rowIndex + 1}: {row}
                    </Text>
                  ))}

                  <Text pt="2" fontSize="md">
                    Мінімальне значення: {overallDispersion}
                  </Text>
                </div>

                <Heading size="xs" my={5} textTransform="uppercase">
                  Критерій максимізації ймовірності розподілу оцінок
                </Heading>
                <Slider
                  flex="1"
                  min={min}
                  max={max}
                  focusThumbOnChange={false}
                  value={value2}
                  onChange={handleChange2}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb fontSize="md" boxSize="32px" children={value2} />
                </Slider>
                <div className="card_inner">
                  {newProbabilities.map((row, rowIndex) => (
                    <Text pt="2" fontSize="md" key={rowIndex}>
                      Z{rowIndex + 1}: {row}
                    </Text>
                  ))}

                  <Text pt="2" fontSize="md">
                    Максимальне значення: {overallProb}
                  </Text>
                </div>

                <Heading size="xs" my={5} textTransform="uppercase">
                  Критерій модальний
                </Heading>
                <div className="card_inner">
                  {modalErr ? (
                    <>
                      <Text pt="2" fontSize="md">
                        {modalErr}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text pt="2" fontSize="md">
                        p0 = p{selectedColumn + 1} ={' '}
                        {columnValues[selectedColumn]}
                      </Text>
                      {columnValuesInMatrix.map((row, rowIndex) => (
                        <Text pt="2" fontSize="md" key={rowIndex}>
                          Z{rowIndex + 1}: {row}
                        </Text>
                      ))}

                      <Text pt="2" fontSize="md">
                        Максимальне значення:{' '}
                        {Math.max(...columnValuesInMatrix)}
                      </Text>
                    </>
                  )}
                </div>
              </>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Matrix;

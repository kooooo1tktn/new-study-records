import { useEffect, useState, useRef } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Button,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import './App.css';
import { deleteRecord, GetAllRecords, newRecord } from './lib/todo';
import { Record } from './domain/record';

function App() {
  // レコードの状態管理
  const [records, setRecords] = useState<Record[]>([]);
  // ローディング状態の管理
  const [loading, setLoading] = useState(true);
  // モーダルの開閉状態管理
  const { isOpen, onOpen, onClose } = useDisclosure();
  // モーダルのフォーカス管理
  const initialRef = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLButtonElement>(null);

  // フォームの型定義
  interface RecordForm {
    title: string;
    time: number;
  }

  // フォームの状態管理をするための変数を取得
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecordForm>({ mode: 'onChange' });

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    const getAllRecords = async () => {
      const recordsData = await GetAllRecords();
      setRecords(recordsData);
      setLoading(false);
    };
    getAllRecords();
  }, []);

  const handleModalClose = () => {
    reset(); // フォームをリセット
    onClose(); // モーダルを閉じる
  };

  // 登録処理
  const onSubmit: SubmitHandler<RecordForm> = async (data: RecordForm) => {
    try {
      // supabaseにデータを登録
      await newRecord(data.title, data.time);
      // データを再取得してテーブルを更新
      const recordsData = await GetAllRecords();
      setRecords(recordsData);
      reset(); // フォームをリセット
      onClose(); // モーダルを閉じる
    } catch (error) {
      console.error('登録エラー ', error);
    }
    // ローディング
    if (loading) {
      return <Spinner thickness="6px" speed="0.65s" emptyColor="gray.200" color="gray.500" size="xl" />;
    }
  };

  // 削除処理
  const onClickDelete = async (id: string) => {
    try {
      // supabaseからデータを削除
      await deleteRecord(id);
      // データを再取得してテーブルを更新
      setRecords(records.filter((record) => record.id !== id));
    } catch (error) {
      console.error('削除エラー', error);
    }
  }

  return (
    <>
      <Heading as="h1" size="3xl">
        シン・学習記録アプリ
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th colSpan={2}>
                <Button colorScheme="teal" mb={4} onClick={onOpen}>
                  新規登録
                </Button>
                <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={handleModalClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>新規登録</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl>
                          <FormLabel>学習内容</FormLabel>
                          <Input type="text" placeholder="学習内容を入力" {...register('title', { required: '内容の入力は必須です' })} />
                          <p>{errors.title?.message}</p>
                        </FormControl>
                        <FormControl mt={4}>
                          <FormLabel>学習時間</FormLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            {...register('time', {
                              required: '時間の入力は必須です',
                              validate: (value) => value > 0 || '時間は0以上である必要があります',
                            })}
                          />
                          <p>{errors.time?.message}</p>
                        </FormControl>
                        <ModalFooter>
                          <Button colorScheme="teal" mr={3} type="submit">
                            登録
                          </Button>
                          <Button onClick={handleModalClose}>Cancel</Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </Th>
            </Tr>
            <Tr>
              <Th>学習内容</Th>
              <Th>学習時間</Th>
            </Tr>
          </Thead>
          <Tbody>
            {records.map((record) => {
              return (
                <Tr key={record.id}>
                  <Td>{record.title}</Td>
                  <Td>{record.time}</Td>
                  <Td>
                    <Button onClick={() => onClickDelete(record.id)}>削除</Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

export default App;

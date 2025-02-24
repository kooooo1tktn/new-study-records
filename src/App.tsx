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
  Center,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdDelete, MdEdit } from 'react-icons/md';

import './App.css';
import { deleteRecord, GetAllRecords, newRecord, updateRecord } from './lib/todo';
import { Record } from './domain/record';

function App() {
  // レコードの状態管理
  const [records, setRecords] = useState<Record[]>([]);

  // ローディング状態の管理
  const [loading, setLoading] = useState(true);

  // モーダルのフォーカス管理
  const initialRef = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLButtonElement>(null);

  // 編集対象のレコード状態管理
  const [editRecord, setEditRecord] = useState<Record | null>(null);

  // モーダルの種類を判定するstateを追加
  const [modalType, setModalType] = useState<'new' | 'edit'>('new');

  // 共通のモーダル状態管理
  const { isOpen, onOpen, onClose } = useDisclosure();

  // モーダルのOpen処理
  const handleModalOpen = (record?: Record) => {
    if (record) {
      setModalType('edit');
      setEditRecord(record);
      reset({ title: record.title, time: record.time });
    } else {
      setModalType('new');
      resetForm();
    }
    onOpen();
  };

  // モーダルのClose処理
  const handleModalClose = () => {
    resetForm();
    onClose();
  };

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

  // ローディング
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner thickness="6px" speed="0.65s" emptyColor="gray.200" color="gray.500" size="xl" role="status" aria-label="Loading" />
      </Center>
    );
  }

  // 共通のリセット処理
  const resetForm = () => {
    reset({
      title: '',
      time: undefined,
    });
    setEditRecord(null);
  };

  // フォームの送信処理
  const onSubmitForm: SubmitHandler<RecordForm> = async (data: RecordForm) => {
    try {
      if (modalType === 'edit' && editRecord) {
        // 編集処理
        await updateRecord(editRecord.id, data.title, data.time);
      } else {
        // 新規登録処理
        await newRecord(data.title, data.time);
      }
      // データを再取得してテーブルを更新
      const recordsData = await GetAllRecords();
      setRecords(recordsData);
      handleModalClose();
    } catch (error) {
      console.error('エラー ', error);
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
  };

  return (
    <>
      <Heading as="h1" size="3xl">
        シン・学習記録アプリ
      </Heading>

      <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalType === 'edit' ? '記録編集' : '新規登録'}</ModalHeader>
          <ModalCloseButton onClick={handleModalClose} />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit(onSubmitForm)}>
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
                  {modalType === 'edit' ? '更新' : '登録'}
                </Button>
                <Button onClick={handleModalClose}>キャンセル</Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <TableContainer>
        <Table variant="simple" data-testid="table">
          <Thead>
            <Tr>
              <Th colSpan={2}>
                <Button colorScheme="teal" mb={4} onClick={() => handleModalOpen()}>
                  新規登録
                </Button>
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
                    <Button mr={4} onClick={() => handleModalOpen(record)} data-testid={`edit-button-${record.id}`}>
                      <MdEdit />
                    </Button>
                    <Button onClick={() => onClickDelete(record.id)} data-testid={`delete-button-${record.id}`}>
                      <MdDelete />
                    </Button>
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

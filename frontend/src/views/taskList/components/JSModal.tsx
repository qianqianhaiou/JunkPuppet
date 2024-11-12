import JavascriptEditor from '@/components/JavascriptEditor';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';

function JSModal({
  defaultJsCode,
  handleCloseEditModal,
  handleEditSave,
}: {
  defaultJsCode: string;
  handleCloseEditModal: any;
  handleEditSave: any;
}) {
  const [code, setCode] = useState(defaultJsCode);
  const [height, setHeight] = useState(400);
  const handleUpdateFn = (code: string) => {
    setCode(code);
  };
  const handleSubmit = () => {
    handleEditSave(code);
  };
  const handleClose = () => {
    handleCloseEditModal();
  };
  useEffect(() => {
    setHeight(window.innerHeight - 300);
  }, []);
  return (
    <Modal
      width='70%'
      title={null}
      open={true}
      onOk={handleSubmit}
      onCancel={handleClose}
      closeIcon={null}
      cancelText='取消'
      maskClosable={false}
      okText='保存'>
      <div className='flex' style={{ height: height + 'px' }}>
        <JavascriptEditor
          defaultCode={code}
          readonly={false}
          updateValue={handleUpdateFn}></JavascriptEditor>
      </div>
    </Modal>
  );
}

export default JSModal;

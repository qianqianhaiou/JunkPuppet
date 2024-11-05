import { useContext } from 'react';
import { TaskContext } from './List';
import { Drawer } from 'antd';

function TaskStepEdit({
  stepData,
  setStepEditVisible,
}: {
  stepData: any;
  setStepEditVisible: any;
}) {
  const { data, drwerHeight } = useContext(TaskContext);
  const handleClose = () => {
    setStepEditVisible(false);
  };
  return (
    <Drawer
      style={{ height: `${drwerHeight}px` }}
      title={
        <div className='w-full flex items-center justify-between'>
          <div>{stepData.operateData.name}</div>
        </div>
      }
      push={false}
      placement='right'
      width={600}
      destroyOnClose={true}
      onClose={handleClose}
      open={true}>
      <div className='whitespace-pre-wrap break-all'>{JSON.stringify(stepData)}</div>
    </Drawer>
  );
}

export default TaskStepEdit;

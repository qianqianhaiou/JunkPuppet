import DistInfo from './DistInfo';
import TaskInfo from './TaskInfo';

function Summary() {
  return (
    <div className='flex items-center justify-center'>
      <DistInfo />
      <TaskInfo />
    </div>
  );
}

export default Summary;

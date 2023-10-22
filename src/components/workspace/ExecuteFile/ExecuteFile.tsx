import { useLogActivity } from '@/hooks/logActivity.hooks';
import { useProjectActions } from '@/hooks/project.hooks';
import { useWorkspaceActions } from '@/hooks/workspace.hooks';
import { Project, Tree } from '@/interfaces/workspace.interface';
import { getFileExtension } from '@/utility/utils';
import { Button, Select, message } from 'antd';
import { FC, useEffect, useState } from 'react';
import s from './ExecuteFile.module.scss';

type ButtonClick =
  | React.MouseEvent<HTMLButtonElement, MouseEvent>
  | React.MouseEvent<HTMLAnchorElement, MouseEvent>;
interface Props {
  file?: Tree | undefined;
  projectId: Project['id'];
  onCompile?: () => void;
  onClick?: (e: ButtonClick, data: string) => void;
  label?: string;
  description?: string;
  allowedFile: string[];
}

const ExecuteFile: FC<Props> = ({
  // file,
  projectId,
  onCompile,
  onClick,
  label = 'Compile',
  description = '',
  allowedFile = [],
}) => {
  const { compileTsFile, projectFiles } = useWorkspaceActions();
  const { compileFuncProgram, compileTactProgram } = useProjectActions();
  const { createLog } = useLogActivity();
  const [selectedFile, setSelectedFile] = useState<Tree | undefined>();

  const fileList = projectFiles(projectId).filter((f) => {
    const _fileExtension = getFileExtension(f?.name || '');
    if (f.name === 'stdlib.fc') return false;
    return allowedFile.includes(_fileExtension as string);
  });

  const buildFile = async (e: ButtonClick) => {
    if (!selectedFile) {
      createLog('Please select a file', 'error');
      return;
    }
    const _fileExtension = getFileExtension(selectedFile?.name);

    if (!selectedFile) return;
    try {
      switch (_fileExtension) {
        case 'ts':
          const code = await compileTsFile(selectedFile, projectId);
          break;
        case 'spec.ts':
          if (!onClick || !selectedFile.path) return;
          onClick(e, selectedFile.path);
          break;
        case 'fc':
          const response = await compileFuncProgram(selectedFile, projectId);
          if (onCompile) {
            onCompile();
          }
          createLog('Contract Built Successfully', 'success');
          break;

        case 'tact':
          try {
            const buildResponse = (await compileTactProgram(
              selectedFile,
              projectId
            )) as Map<string, Buffer>;

            if (onCompile) {
              onCompile();
            }
            createLog('Built Successfully', 'success');
          } catch (error: any) {
            const errroMessage = error?.message?.split('\n');
            for (let i = 0; i < errroMessage.length; i++) {
              createLog(errroMessage[i], 'error', true, true);
            }
          }
          break;
      }
    } catch (error) {
      if (typeof error === 'string') {
        createLog(error, 'error');
        return;
      }
      message.error(
        'Something went wrong. Check browser console for more details'
      );
      console.log('error', error);
    }
  };

  const selectFile = (e: any) => {
    const selectedFile = fileList.find((f) => {
      if (typeof e === 'string') return f.id === e;
      return f.id === e.target.value;
    });
    setSelectedFile(selectedFile);
  };

  useEffect(() => {
    setSelectedFile(fileList[0]);
  }, [fileList]);

  return (
    <div className={s.root}>
      {description && <p className={s.desc}>{description}</p>}
      <Select
        allowClear
        showSearch
        className="w-100"
        defaultActiveFirstOption
        value={selectedFile?.id}
        onChange={selectFile}
        filterOption={(inputValue, option) => {
          return option?.title.toLowerCase().includes(inputValue.toLowerCase());
        }}
      >
        {fileList.map((f) => (
          <Select.Option key={f.id} value={f.id} title={f.path}>
            {f.name}
          </Select.Option>
        ))}
      </Select>
      <Button
        type="primary"
        className={`${s.action} w-100`}
        disabled={!selectedFile}
        onClick={buildFile}
      >
        {label}
      </Button>
    </div>
  );
};

export default ExecuteFile;

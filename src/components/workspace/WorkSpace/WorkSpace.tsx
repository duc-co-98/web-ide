import { useWorkspaceActions } from '@/hooks/workspace.hooks';
import Router, { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import BuildProject from '../BuildProject';
import Editor from '../Editor';
import Tabs from '../Tabs';
import TestCases from '../TestCases';
import FileTree from '../tree/FileTree';
import ItemAction from '../tree/FileTree/ItemActions';
import WorkspaceSidebar from '../WorkspaceSidebar';
import { WorkSpaceMenu } from '../WorkspaceSidebar/WorkspaceSidebar';
import s from './WorkSpace.module.scss';

const WorkSpace: FC = () => {
  const workspaceAction = useWorkspaceActions();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<WorkSpaceMenu>('code');
  const [isLoaded, setIsLoaded] = useState(false);
  const [codeBOC, setCodeBOC] = useState('');

  const { id: projectId, tab } = router.query;

  const activeFile = workspaceAction.activeFile(projectId as string);

  const commitItemCreation = (type: string, name: string) => {
    workspaceAction.createNewItem('', name, type, projectId as string);
  };

  useEffect(() => {
    if (!projectId) {
      return;
    }
    if (workspaceAction.projectFiles(projectId as string).length === 0) {
      Router.push('/project');
    }
  }, [projectId]);

  useEffect(() => {
    return () => {
      workspaceAction.closeAllFile();
    };
  }, []);

  useEffect(() => {
    if (tab) {
      setActiveMenu(tab as WorkSpaceMenu);
    }
    setIsLoaded(true);
  }, [tab]);

  return (
    <div className={`${s.root} show-file-icons`}>
      <div className={s.sidebar}>
        <WorkspaceSidebar
          activeMenu={activeMenu}
          onMenuClicked={(name) => {
            setActiveMenu(name);
            router.replace({
              query: { ...router.query, tab: name },
            });
          }}
        />
      </div>
      <div className={s.tree}>
        {isLoaded && activeMenu === 'code' && (
          <>
            <div className={s.globalAction}>
              <span>Project</span>
              <ItemAction
                className={`${s.visible}`}
                allowedActions={['NewFile', 'NewFolder']}
                onNewFile={() => commitItemCreation('file', 'new file')}
                onNewDirectory={() =>
                  commitItemCreation('directory', 'new folder')
                }
              />
            </div>
            <FileTree projectId={projectId as string} />
          </>
        )}
        {(activeMenu === 'build' || activeMenu === 'test-cases') && (
          <BuildProject
            projectId={projectId as string}
            onCodeCompile={(_codeBOC) => {
              setCodeBOC(_codeBOC);
            }}
          />
        )}
      </div>
      <div className={s.workArea}>
        {isLoaded && (
          <>
            {activeMenu !== 'test-cases' && (
              <Tabs projectId={projectId as string} />
            )}

            {activeMenu === 'test-cases' && (
              <div className={s.testCaseArea}>
                {codeBOC ? (
                  <TestCases
                    codeBOC={codeBOC}
                    projectId={projectId as string}
                  />
                ) : (
                  <h3>Build Your project first to run test cases</h3>
                )}
              </div>
            )}

            {activeFile && activeMenu !== 'test-cases' && (
              <Editor
                file={activeFile as any}
                projectId={projectId as string}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkSpace;

import { Blockchain, SandboxContract, } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { TactCounter } from '../dist/tact_TactCounter';
import '@ton/test-utils';

describe('TactCounter', () => {
  let blockchain: Blockchain;
  let tactCounter: SandboxContract<TactCounter>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    tactCounter = blockchain.openContract(await TactCounter.fromInit(0n));

    const deployer = await blockchain.treasury('deploy');

    const deployResult = await tactCounter.send(
      deployer.getSender(),
      {
        value: toNano('0.05'),
      },
      {
        $type: 'Deploy',
        queryId: 0n,
      }
    );
    
    expect(deployResult.transactions).toHaveTransaction({
      from: increaser.address,
      to: tactCounter.address,
      success: true,
    });

    const counterAfter = await tactCounter.getCounter();

    console.log()('counter after increasing', counterAfter);
    
    expect(counterAfter).toBe(counterBefore + increaseBy);
  });
});

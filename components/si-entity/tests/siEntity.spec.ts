import {
  SiEntity,
  OpType,
  OpSource,
  OpSet,
  OpTombstone,
} from "../src/siEntity";

interface TestData {
  siAttr: SiEntity;
}

function setupTest(entityType: string): TestData {
  const siAttr = new SiEntity({ entityType });
  return { siAttr };
}

describe("siAttr", () => {
  describe("new", () => {
    test("returns an SiAttr", () => {
      const { siAttr } = setupTest("service");
      expect(siAttr).toBeInstanceOf(SiEntity);
    });
  });

  // inferred baseline  X      Y      Y      X      X
  // inferred system    Y      X      Y      X      X
  // manual baseline    Y      Y      X      Y      X
  // manual system      Y      Y      Y      Y      Y
  //                   IB     IS     MB   IB+IS   IB+IS+MB
  describe("isTombstoned", () => {
    describe("Inferred Baseline", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "baseline",
          path: ["simpleString"],
        });
      }
      test("disallows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("allows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
      test("allows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(false);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
    describe("Inferred System", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "system:1",
          path: ["simpleString"],
        });
      }
      test("allows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(false);
      });
      test("disallows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(true);
      });
      test("allows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(false);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
    describe("Manual Baseline", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Manual,
          system: "baseline",
          path: ["simpleString"],
        });
      }
      test("allows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(false);
      });
      test("allows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
      test("disallows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
    describe("Inferred Baseline + Inferred System", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "baseline",
          path: ["simpleString"],
        });
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "system:1",
          path: ["simpleString"],
        });
      }
      test("disallows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("disallows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(true);
      });
      test("allows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(false);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
    describe("Inferred Baseline + Inferred System + Manual Baseline", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "baseline",
          path: ["simpleString"],
        });
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "system:1",
          path: ["simpleString"],
        });
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Manual,
          system: "baseline",
          path: ["simpleString"],
        });
      }
      test("disallows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("disallows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(true);
      });
      test("disallows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
    describe("Nested Inferred Baseline + Inferred System + Manual Baseline", () => {
      function setupTombstone(siAttr: SiEntity) {
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "baseline",
          path: ["frobNob"],
        });
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Inferred,
          system: "system:1",
          path: ["frobNob"],
        });
        siAttr.addOpTombstone({
          op: OpType.Tombstone,
          source: OpSource.Manual,
          system: "baseline",
          path: ["frobNob"],
        });
      }
      test("disallows inferred baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["frobNob", "sugar", "patience"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("disallows inferred system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["frobNob", "sugar", "patience"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(true);
      });
      test("disallows manual baseline values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["frobNob", "sugar", "patience"],
          value: "funtimes",
          system: "baseline",
        });
        expect(firstResult).toBe(true);
      });
      test("allows manual system values", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupTombstone(siAttr);
        const firstResult = siAttr.isTombstoned({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["frobNob", "sugar", "patience"],
          value: "funtimes",
          system: "system:1",
        });
        expect(firstResult).toBe(false);
      });
    });
  });

  describe("addOpTombstone", () => {
    test("adds tombstone", () => {
      const { siAttr } = setupTest("leftHandPath");
      const tombstone: OpTombstone = {
        op: OpType.Tombstone,
        source: OpSource.Inferred,
        system: "baseline",
        path: ["simpleString"],
      };
      siAttr.addOpTombstone(tombstone);
      expect(siAttr.tombstones).toContain(tombstone);
    });
    test("doesn't allow duplicate tombstones", () => {
      const { siAttr } = setupTest("leftHandPath");
      const tombstone: OpTombstone = {
        op: OpType.Tombstone,
        source: OpSource.Inferred,
        system: "baseline",
        path: ["simpleString"],
      };
      siAttr.addOpTombstone(tombstone);
      siAttr.addOpTombstone(tombstone);
      expect(siAttr.tombstones).toContain(tombstone);
      expect(siAttr.tombstones.length).toBe(1);
    });
  });

  describe("removeOpTombstone", () => {
    test("removes existing tombstones", () => {
      const { siAttr } = setupTest("leftHandPath");
      const tombstone: OpTombstone = {
        op: OpType.Tombstone,
        source: OpSource.Inferred,
        system: "baseline",
        path: ["simpleString"],
      };
      siAttr.addOpTombstone(tombstone);
      expect(siAttr.tombstones).toContain(tombstone);
      siAttr.removeOpTombstone(tombstone);
      expect(siAttr.tombstones).not.toContain(tombstone);
    });
  });

  describe("addOpSet", () => {
    test("adds valid operation", () => {
      const { siAttr } = setupTest("leftHandPath");
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "tooshy",
        system: "baseline",
      };
      const result = siAttr.addOpSet(op);
      expect(result).toEqual({ success: true });
      expect(siAttr.ops).toContain(op);
    });
    test("rejects invalid operation", () => {
      const { siAttr } = setupTest("leftHandPath");
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "&#^^!!@",
        system: "baseline",
      };
      const result = siAttr.addOpSet(op);
      expect(result).toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringMatching(/alphanumeric/),
          ]),
        }),
      );
      expect(siAttr.ops).not.toContain(op);
    });
    test("replaces previous set operation", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "tooshy",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(firstOp);
      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "pickafight",
        system: "baseline",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(secondOp);
      expect(siAttr.ops).not.toContain(firstOp);
    });
    test("ignores previous set operation for different systems", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "tooshy",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(firstOp);
      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "pickafight",
        system: "sticky",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(secondOp);
      expect(siAttr.ops).toContain(firstOp);
    });
    test("ignores previous set operation for different sources", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "tooshy",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(firstOp);
      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Inferred,
        path: ["simpleString"],
        value: "pickafight",
        system: "baseline",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(secondOp);
      expect(siAttr.ops).toContain(firstOp);
    });
  });
  describe("addOpUnset", () => {
    test("removes valid operation at path", () => {
      const { siAttr } = setupTest("leftHandPath");
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "tooshy",
        system: "baseline",
      };
      const setResult = siAttr.addOpSet(op);
      expect(setResult).toEqual({ success: true });
      expect(siAttr.ops).toContain(op);
      siAttr.addOpUnset({
        op: OpType.Unset,
        source: OpSource.Manual,
        path: ["simpleString"],
        system: "baseline",
      });
      expect(siAttr.ops).not.toContain(op);
    });
    test("removes multiple operations under path", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["frobNob", "chrisCornell"],
        value: "was great",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);
      expect(firstSetResult).toEqual({ success: true });
      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["frobNob", "sugar", "patience"],
        value: "was great",
        system: "baseline",
      };
      const secondSetResult = siAttr.addOpSet(secondOp);
      expect(secondSetResult).toEqual({ success: true });
      const thirdOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["frobNob", "sugar", "wait", "slow"],
        value: "was fine",
        system: "baseline",
      };
      const thirdSetResult = siAttr.addOpSet(thirdOp);
      expect(thirdSetResult).toEqual({ success: true });

      siAttr.addOpUnset({
        op: OpType.Unset,
        source: OpSource.Manual,
        path: ["frobNob", "sugar"],
        system: "baseline",
      });
      expect(siAttr.ops).toContain(firstOp);
      expect(siAttr.ops).not.toContain(secondOp);
      expect(siAttr.ops).not.toContain(thirdOp);
    });
  });

  describe("decrementArrayMetaLength", () => {
    test("decrements the length when an op is unset", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "0"],
        value: "thunderStruck",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);
      expect(firstSetResult).toEqual({ success: true });

      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "1"],
        value: "cheese",
        system: "baseline",
      };
      const secondSetResult = siAttr.addOpSet(secondOp);
      expect(secondSetResult).toEqual({ success: true });

      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.wanda": {
            length: 2,
          },
        }),
      );

      siAttr.addOpUnset({
        op: OpType.Unset,
        path: ["wanda", "1"],
        source: OpSource.Manual,
        system: "baseline",
      });

      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.wanda": {
            length: 1,
          },
        }),
      );
    });
  });

  describe("updateArrayMetaLength", () => {
    test("creates an array meta if it is missing", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "0"],
        value: "thunderStruck",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);
      expect(firstSetResult).toEqual({ success: true });
      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.wanda": expect.objectContaining({
            length: 1,
          }),
        }),
      );
    });

    test("sets the length to the highest index on initial create", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "10"],
        value: "thunderStruck",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);
      expect(firstSetResult).toEqual({ success: true });
      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.wanda": expect.objectContaining({
            length: 11,
          }),
        }),
      );
    });

    test("sets the length to the highest index on multiple entries", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "0"],
        value: "thunderStruck",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);

      expect(firstSetResult).toEqual({ success: true });
      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["wanda", "10"],
        value: "thunderStruck",
        system: "baseline",
      };
      const secondSetResult = siAttr.addOpSet(secondOp);
      expect(secondSetResult).toEqual({ success: true });

      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.wanda": expect.objectContaining({
            length: 11,
          }),
        }),
      );
    });

    test("creates array meta if it is missing for multiple nested arrays", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: [
          "nestedArrays",
          "darkness",
          "0",
          "surrounds",
          "justice",
          "10",
          "prevails",
        ],
        value: "eventually",
        system: "baseline",
      };
      const firstSetResult = siAttr.addOpSet(firstOp);
      expect(firstSetResult).toEqual({ success: true });
      expect(siAttr.arrayMeta).toEqual(
        expect.objectContaining({
          "leftHandPath.nestedArrays.darkness": expect.objectContaining({
            length: 1,
          }),
          "leftHandPath.nestedArrays.darkness.0.surrounds.justice": expect.objectContaining(
            {
              length: 11,
            },
          ),
        }),
      );
    });
  });

  describe("computeProperties", () => {
    test("simple scalar value for baseline with no systems", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "motordeath",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });

      siAttr.computeProperties();
      expect(siAttr.properties).toEqual(
        expect.objectContaining({
          baseline: expect.objectContaining({
            simpleString: "motordeath",
          }),
        }),
      );
    });

    test("simple scalar value for baseline with one system", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "motordeath",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });

      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleNumber"],
        value: 5,
        system: "system:1",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });

      siAttr.computeProperties();
      expect(siAttr.properties).toEqual(
        expect.objectContaining({
          baseline: {
            simpleString: "motordeath",
          },
          "system:1": {
            simpleString: "motordeath",
            simpleNumber: 5,
          },
        }),
      );
    });

    test("simple scalar value for baseline with manual overriding inferred", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "thecrown",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });

      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Inferred,
        path: ["simpleString"],
        value: "motordeath",
        system: "baseline",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });

      siAttr.computeProperties();
      expect(siAttr.properties).toEqual(
        expect.objectContaining({
          baseline: {
            simpleString: "thecrown",
          },
        }),
      );
    });

    test("simple scalar value for baseline with system overriding", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "thecrown",
        system: "system:1",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });

      const secondOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "motordeath",
        system: "baseline",
      };
      const secondResult = siAttr.addOpSet(secondOp);
      expect(secondResult).toEqual({ success: true });

      siAttr.computeProperties();
      expect(siAttr.properties).toEqual(
        expect.objectContaining({
          baseline: {
            simpleString: "motordeath",
          },
          "system:1": {
            simpleString: "thecrown",
          },
        }),
      );
    });

    test("simple scalar value that is tombstoned should not appear", () => {
      const { siAttr } = setupTest("leftHandPath");
      const firstOp: OpSet = {
        op: OpType.Set,
        source: OpSource.Inferred,
        path: ["simpleString"],
        value: "motordeath",
        system: "baseline",
      };
      const firstResult = siAttr.addOpSet(firstOp);
      expect(firstResult).toEqual({ success: true });

      siAttr.addOpTombstone({
        op: OpType.Tombstone,
        source: OpSource.Inferred,
        system: "baseline",
        path: ["simpleString"],
      });
      siAttr.computeProperties();
      expect(siAttr.properties).toEqual(
        expect.objectContaining({
          baseline: {},
        }),
      );
    });

    describe("arrays", () => {
      describe("baseline", () => {
        test("multiple values", () => {
          const { siAttr } = setupTest("leftHandPath");
          const firstOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: ["wanda", "0"],
            value: "theCrown",
            system: "baseline",
          };
          const firstResult = siAttr.addOpSet(firstOp);
          expect(firstResult).toEqual({ success: true });

          const secondOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: ["wanda", "1"],
            value: "gizmachi",
            system: "baseline",
          };
          const secondResult = siAttr.addOpSet(secondOp);
          expect(secondResult).toEqual({ success: true });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: { wanda: ["theCrown", "gizmachi"] },
            }),
          );
        });

        test("with overrides", () => {
          const { siAttr } = setupTest("leftHandPath");
          const firstOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "0"],
            value: "theCrown",
            system: "baseline",
          };
          const firstResult = siAttr.addOpSet(firstOp);
          expect(firstResult).toEqual({ success: true });

          const secondOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "1"],
            value: "gizmachi",
            system: "baseline",
          };
          const secondResult = siAttr.addOpSet(secondOp);
          expect(secondResult).toEqual({ success: true });

          const thirdOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: ["wanda", "1"],
            value: "snoopy",
            system: "baseline",
          };
          const thirdResult = siAttr.addOpSet(thirdOp);
          expect(thirdResult).toEqual({ success: true });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: { wanda: ["theCrown", "snoopy"] },
            }),
          );
        });
        test("with systems override", () => {
          const { siAttr } = setupTest("leftHandPath");
          const firstOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "0"],
            value: "theCrown",
            system: "baseline",
          };
          const firstResult = siAttr.addOpSet(firstOp);
          expect(firstResult).toEqual({ success: true });

          const secondOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "1"],
            value: "gizmachi",
            system: "baseline",
          };
          const secondResult = siAttr.addOpSet(secondOp);
          expect(secondResult).toEqual({ success: true });

          const thirdOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "1"],
            value: "snoopy",
            system: "system:1",
          };
          const thirdResult = siAttr.addOpSet(thirdOp);
          expect(thirdResult).toEqual({ success: true });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: { wanda: ["theCrown", "gizmachi"] },
              "system:1": { wanda: ["theCrown", "snoopy"] },
            }),
          );
        });
        test("with systems disjoint", () => {
          const { siAttr } = setupTest("leftHandPath");
          const firstOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "0"],
            value: "theCrown",
            system: "baseline",
          };
          const firstResult = siAttr.addOpSet(firstOp);
          expect(firstResult).toEqual({ success: true });

          const secondOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "1"],
            value: "gizmachi",
            system: "baseline",
          };
          const secondResult = siAttr.addOpSet(secondOp);
          expect(secondResult).toEqual({ success: true });

          const thirdOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "2"],
            value: "snoopy",
            system: "system:1",
          };
          const thirdResult = siAttr.addOpSet(thirdOp);
          expect(thirdResult).toEqual({ success: true });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: { wanda: ["theCrown", "gizmachi"] },
              "system:1": { wanda: ["theCrown", "gizmachi", "snoopy"] },
            }),
          );
        });

        test("with systems disjoint and sparse", () => {
          const { siAttr } = setupTest("leftHandPath");
          const firstOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "0"],
            value: "theCrown",
            system: "baseline",
          };
          const firstResult = siAttr.addOpSet(firstOp);
          expect(firstResult).toEqual({ success: true });

          const secondOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "1"],
            value: "gizmachi",
            system: "baseline",
          };
          const secondResult = siAttr.addOpSet(secondOp);
          expect(secondResult).toEqual({ success: true });

          const thirdOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "2"],
            value: "snoopy",
            system: "system:1",
          };
          const thirdResult = siAttr.addOpSet(thirdOp);
          expect(thirdResult).toEqual({ success: true });

          const fourthOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: ["wanda", "3"],
            value: "myown",
            system: "baseline",
          };
          const fourthResult = siAttr.addOpSet(fourthOp);
          expect(fourthResult).toEqual({ success: true });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: { wanda: ["theCrown", "gizmachi", "myown"] },
              "system:1": {
                wanda: ["theCrown", "gizmachi", "snoopy", "myown"],
              },
            }),
          );
        });

        test("with nested systems disjoint and sparse", () => {
          const { siAttr } = setupTest("leftHandPath");
          const aOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "0",
              "prevails",
            ],
            value: "theCrown",
            system: "baseline",
          };
          siAttr.addOpSet(aOp);
          const bOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "1",
              "prevails",
            ],
            value: "shout",
            system: "system:1",
          };
          siAttr.addOpSet(bOp);
          const cOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "2",
              "prevails",
            ],
            value: "holyDiver",
            system: "baseline",
          };
          siAttr.addOpSet(cOp);
          const dOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: [
              "nestedArrays",
              "darkness",
              "1",
              "surrounds",
              "justice",
              "0",
              "prevails",
            ],
            value: "get away",
            system: "baseline",
          };
          siAttr.addOpSet(dOp);

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: {
                nestedArrays: {
                  darkness: [
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "theCrown",
                          },
                          {
                            prevails: "holyDiver",
                          },
                        ],
                      },
                    },
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "get away",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              "system:1": {
                nestedArrays: {
                  darkness: [
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "theCrown",
                          },
                          {
                            prevails: "shout",
                          },
                          {
                            prevails: "holyDiver",
                          },
                        ],
                      },
                    },
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "get away",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            }),
          );
        });

        test("with nested systems disjoint, sparse and tombstoned", () => {
          const { siAttr } = setupTest("leftHandPath");
          const aOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Inferred,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "0",
              "prevails",
            ],
            value: "theCrown",
            system: "baseline",
          };
          siAttr.addOpSet(aOp);
          const bOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "1",
              "prevails",
            ],
            value: "shout",
            system: "system:1",
          };
          siAttr.addOpSet(bOp);
          const cOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: [
              "nestedArrays",
              "darkness",
              "0",
              "surrounds",
              "justice",
              "2",
              "prevails",
            ],
            value: "holyDiver",
            system: "baseline",
          };
          siAttr.addOpSet(cOp);
          const dOp: OpSet = {
            op: OpType.Set,
            source: OpSource.Manual,
            path: [
              "nestedArrays",
              "darkness",
              "1",
              "surrounds",
              "justice",
              "0",
              "prevails",
            ],
            value: "get away",
            system: "baseline",
          };
          siAttr.addOpSet(dOp);

          siAttr.addOpTombstone({
            op: OpType.Tombstone,
            source: OpSource.Inferred,
            path: ["nestedArrays"],
            system: "baseline",
          });

          siAttr.computeProperties();
          expect(siAttr.properties).toEqual(
            expect.objectContaining({
              baseline: {
                nestedArrays: {
                  darkness: [
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "holyDiver",
                          },
                        ],
                      },
                    },
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "get away",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              "system:1": {
                nestedArrays: {
                  darkness: [
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "shout",
                          },
                          {
                            prevails: "holyDiver",
                          },
                        ],
                      },
                    },
                    {
                      surrounds: {
                        justice: [
                          {
                            prevails: "get away",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            }),
          );
        });
      });
    });
  });

  describe("isOverridden", () => {
    describe("inferred baseline", () => {
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Inferred,
        path: ["simpleString"],
        value: "thecrown",
        system: "baseline",
      };

      function setupOps(siAttr: SiEntity) {
        siAttr.addOpSet(op);
      }

      test("overriden by inferred system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "stretch",
          system: "system:1",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(true);
      });

      test("overriden by manual baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(true);
      });

      test("overriden by manual system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "system:1",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(true);
      });
    });

    describe("inferred system", () => {
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Inferred,
        path: ["simpleString"],
        value: "thecrown",
        system: "system:1",
      };

      function setupOps(siAttr: SiEntity) {
        siAttr.addOpSet(op);
      }

      test("not overriden by inferred baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(false);
      });

      test("not overriden by manual baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
      });

      test("overriden by manual system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "system:1",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(true);
      });
    });

    describe("manual baseline", () => {
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "thecrown",
        system: "baseline",
      };

      function setupOps(siAttr: SiEntity) {
        siAttr.addOpSet(op);
      }

      test("not overriden by inferred baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
      });

      test("not overriden by manual baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
      });

      test("overriden by manual system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "system:1",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(true);
      });
    });

    describe("manual system", () => {
      const op: OpSet = {
        op: OpType.Set,
        source: OpSource.Manual,
        path: ["simpleString"],
        value: "thecrown",
        system: "system:1",
      };

      function setupOps(siAttr: SiEntity) {
        siAttr.addOpSet(op);
      }

      test("not overriden by inferred baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
      });

      test("not overriden by inferred system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);

        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Inferred,
          path: ["simpleString"],
          value: "stretch",
          system: "system:1",
        });
        expect(siAttr.isOverridden(op, "system:1")).toBe(false);
      });

      test("not overriden by manual baseline", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);
        siAttr.addOpSet({
          op: OpType.Set,
          source: OpSource.Manual,
          path: ["simpleString"],
          value: "stretch",
          system: "baseline",
        });
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
      });

      test("not overriden by manual system", () => {
        const { siAttr } = setupTest("leftHandPath");
        setupOps(siAttr);
        expect(siAttr.isOverridden(op, "baseline")).toBe(false);
        expect(siAttr.isOverridden(op, "system:1")).toBe(false);
      });
    });
  });
});
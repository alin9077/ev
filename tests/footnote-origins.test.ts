// Uses the actual component source. This hook adapter is not a React renderer.
import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import {
  applicationRequire,
  compiledSource,
  elementNodes,
  type ElementNode,
} from "./helpers/compiled-source";

type Dependencies = readonly unknown[] | undefined;
type Effect = () => void | (() => void);
type EffectCell = {
  dependencies: Dependencies;
  cleanup: (() => void) | undefined;
};
type PendingEffect = { create: Effect; dependencies: Dependencies };
type MemoCell = { dependencies: Dependencies; value: unknown };
type StateCell = { value: unknown; set: (next: unknown) => void };

function equalDependencies(left: Dependencies, right: Dependencies) {
  return left !== undefined && right !== undefined &&
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]));
}

/** Explicit render/commit storage; effects never run while rendering. */
class Hooks {
  private states: StateCell[] = [];
  readonly refs: { current: unknown }[] = [];
  private memos: MemoCell[] = [];
  private effects: EffectCell[] = [];
  private workMemos: MemoCell[] = [];
  private workEffects: PendingEffect[] = [];
  private stateCursor = 0;
  private refCursor = 0;
  private memoCursor = 0;
  private idCursor = 0;

  constructor(readonly name: string) {}

  begin() {
    this.stateCursor = this.refCursor = this.memoCursor = this.idCursor = 0;
    this.workMemos = [];
    this.workEffects = [];
  }

  state(initial: unknown) {
    const index = this.stateCursor++;
    let cell = this.states[index];
    if (!cell) {
      cell = {
        value: typeof initial === "function" ? initial() : initial,
        set: (next: unknown) => {
          cell.value = typeof next === "function" ? next(cell.value) : next;
        },
      };
      this.states[index] = cell;
    }
    return [cell.value, cell.set];
  }

  ref(initial: unknown) {
    const index = this.refCursor++;
    return this.refs[index] ??= { current: initial };
  }

  memo(create: () => unknown, dependencies: Dependencies) {
    const index = this.memoCursor++;
    const previous = this.memos[index];
    const cell = previous && equalDependencies(previous.dependencies, dependencies)
      ? previous
      : { dependencies, value: create() };
    this.workMemos[index] = cell;
    return cell.value;
  }

  effect(create: Effect, dependencies: Dependencies) {
    this.workEffects.push({ create, dependencies });
  }

  id() {
    return `${this.name}-${this.idCursor++}`;
  }

  commit() {
    const changed = this.workEffects
      .map((effect, index) => ({ effect, index }))
      .filter(({ effect, index }) => !this.effects[index] ||
        !equalDependencies(this.effects[index].dependencies, effect.dependencies));
    this.memos = this.workMemos;
    // Cleanups precede setups. Dependencies advance only on commit.
    for (const { index } of changed) this.effects[index]?.cleanup?.();
    for (const { effect, index } of changed) {
      const cleanup = effect.create();
      this.effects[index] = {
        dependencies: effect.dependencies,
        cleanup: typeof cleanup === "function" ? cleanup : undefined,
      };
    }
    this.workEffects = [];
    return changed.length;
  }

  unmount() {
    this.workEffects = [];
    for (const effect of this.effects) effect?.cleanup?.();
    this.effects = [];
  }
}

type Group = { ids: string[]; number: number; count: number };
type ContextValue = {
  prefix: string;
  groups: Record<string, Group>;
  register: (key: string, delta: number) => void;
  remember: (number: number, origin: unknown) => void;
};
type Call = { method: string; args: unknown[] };
type Origin = {
  isConnected: boolean;
  hidden: boolean;
  calls: Call[];
  focus: (...args: unknown[]) => void;
  scrollIntoView: (...args: unknown[]) => void;
};
type ClickEvent = { preventDefault: () => void; currentTarget?: Origin };

function origin(): Origin {
  const calls: Call[] = [];
  return {
    isConnected: true,
    hidden: false,
    calls,
    focus: (...args) => { calls.push({ method: "focus", args }); },
    scrollIntoView: (...args) => { calls.push({ method: "scrollIntoView", args }); },
  };
}

function click(node: ElementNode, currentTarget?: Origin) {
  const handler = node.props.onClick as unknown as ((event: ClickEvent) => void);
  assert.equal(typeof handler, "function");
  let prevented = 0;
  handler({ currentTarget, preventDefault: () => { prevented++; } });
  return prevented;
}

const mediaFixtures = new WeakSet<TestContext>();
function harness(t: TestContext) {
  // Multiple provider fixtures in one test share one correctly restored global.
  if (!mediaFixtures.has(t)) {
    mediaFixtures.add(t);
    const priorMatchMedia = Object.getOwnPropertyDescriptor(globalThis, "matchMedia");
    Object.defineProperty(globalThis, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false }),
    });
    t.after(() => {
      if (priorMatchMedia) Object.defineProperty(globalThis, "matchMedia", priorMatchMedia);
      else Reflect.deleteProperty(globalThis, "matchMedia");
    });
  }

  const provider = new Hooks("provider");
  let active: Hooks | undefined;
  let context: ContextValue;
  let tree: unknown;
  let sources: unknown[] = [];
  const hooks = () => {
    assert.ok(active, "hook called outside an explicit fixture render");
    return active;
  };
  const note = {
    closest: () => ({ open: false }),
    scrollIntoView: () => undefined,
    focus: () => undefined,
  };
  const documentValue = {
    getElementById: (id: string) =>
      elementNodes(tree).some((node) => node.type === "li" && node.props.id === id)
        ? note : null,
  };
  const actual = compiledSource("src/components/footnotes.tsx", {
    react: {
      ...applicationRequire("react"),
      useState: (initial: unknown) => hooks().state(initial),
      useRef: (initial: unknown) => hooks().ref(initial),
      useMemo: (create: () => unknown, dependencies: Dependencies) =>
        hooks().memo(create, dependencies),
      useCallback: (callback: unknown, dependencies: Dependencies) =>
        hooks().memo(() => callback, dependencies),
      useEffect: (create: Effect, dependencies: Dependencies) =>
        hooks().effect(create, dependencies),
      useContext: () => context,
      useId: () => hooks().id(),
    },
    "@/lib/config": applicationRequire("./src/lib/config.ts"),
  }, documentValue);
  const Provider = actual.FootnoteProvider as (props: {
    sources: unknown[]; children: null;
  }) => unknown;
  const Reference = actual.FootnoteRefs as (props: { ids: string[] }) => unknown;

  function renderWith(instance: Hooks, render: () => unknown) {
    assert.equal(active, undefined);
    active = instance;
    instance.begin();
    try { return render(); } finally { active = undefined; }
  }

  function renderProvider(nextSources = sources) {
    sources = nextSources;
    tree = renderWith(provider, () => Provider({ sources, children: null }));
    context = (tree as ElementNode).props.value as ContextValue;
    assert.ok(context?.groups);
    return tree;
  }

  function reference(name: string, ids: string[]) {
    const instance = new Hooks(name);
    const render = () => renderWith(instance, () => Reference({ ids }));
    return {
      render,
      commit: () => instance.commit(),
      unmount: () => instance.unmount(),
      click: (target: Origin) => {
        const node = elementNodes(render()).find((entry) => entry.type === "a");
        assert.ok(node, "reference must be registered before it can be clicked");
        instance.commit();
        return click(node, target);
      },
    };
  }

  renderProvider();
  provider.commit();
  return {
    renderProvider,
    commitProvider: () => provider.commit(),
    reference,
    get context() { return context; },
    get origins() {
      const map = provider.refs[0]?.current;
      assert.ok(map instanceof Map);
      return map as Map<number, Origin>;
    },
    back(number: number) {
      const li = elementNodes(tree).find((node) =>
        node.type === "li" && node.props.id === `${context.prefix}-${number}`);
      assert.ok(li, "Back must be selected from an active, rendered note");
      const back = elementNodes(li).find((node) =>
        node.type === "a" && node.props.className === "footnote-back");
      assert.ok(back);
      return click(back);
    },
    activeNumbers() {
      return elementNodes(tree).filter((node) => node.type === "li")
        .map((node) => node.props.value);
    },
  };
}

function mountedPair(t: TestContext) {
  const h = harness(t);
  const a = h.reference("a", ["source-g"]);
  const b = h.reference("b", ["source-g"]);
  a.render(); a.commit();
  b.render(); b.commit();
  h.renderProvider(); h.commitProvider();
  return { h, a, b, number: h.context.groups["source-g"].number };
}

const expectedBackCalls: Call[] = [
  { method: "focus", args: [] },
  { method: "scrollIntoView", args: [{ block: "center" }] },
];

test("actual cleanup prunes only after provider commit while the group stays active", (t) => {
  const { h, a, number } = mountedPair(t);
  const remembered = origin();
  assert.equal(a.click(remembered), 1);
  remembered.isConnected = false;
  a.unmount(); // Actual FootnoteRefs effect cleanup calls register(key, -1).
  assert.equal(h.origins.get(number), remembered);
  h.renderProvider();
  assert.equal(h.context.groups["source-g"].count, 1);
  assert.equal(h.origins.get(number), remembered, "render must not prune");
  h.commitProvider();
  assert.equal(h.origins.has(number), false);
  assert.deepEqual(h.activeNumbers(), [number]);
  assert.deepEqual(remembered.calls, []);
  assert.equal(h.back(number), 1);
  assert.deepEqual(remembered.calls, []);
});

test("removing a remembered duplicate has no implicit fallback; clicking its sibling restores Back", (t) => {
  const { h, a, b, number } = mountedPair(t);
  const first = origin();
  const sibling = origin();
  a.click(first);
  first.isConnected = false;
  a.unmount();
  h.renderProvider(); h.commitProvider();
  assert.equal(h.back(number), 1);
  assert.deepEqual(first.calls, []);
  assert.deepEqual(sibling.calls, []);
  assert.equal(h.origins.has(number), false);
  b.click(sibling);
  assert.equal(h.back(number), 1);
  assert.deepEqual(sibling.calls, expectedBackCalls);
});

test("last-reference removal retains historic numbering and remount gets a new remembered origin", (t) => {
  const h = harness(t);
  const a = h.reference("a", ["source-b", "source-a", "source-a"]);
  const other = h.reference("other", ["source-h"]);
  a.render(); a.commit(); other.render(); other.commit();
  h.renderProvider(); h.commitProvider();
  const key = "source-a|source-b";
  const number = h.context.groups[key].number;
  const otherNumber = h.context.groups["source-h"].number;
  const old = origin();
  a.click(old);
  old.isConnected = false;
  a.unmount();
  h.renderProvider(); h.commitProvider();
  assert.equal(h.context.groups[key].count, 0);
  assert.equal(h.context.groups[key].number, number);
  assert.equal(h.origins.has(number), false);
  assert.deepEqual(h.activeNumbers(), [otherNumber]);
  const later = h.reference("later", ["source-new"]);
  later.render(); later.commit();
  h.renderProvider(); h.commitProvider();
  assert.ok(h.context.groups["source-new"].number > Math.max(number, otherNumber));
  const returned = h.reference("returned", ["source-a", "source-b"]);
  returned.render(); returned.commit();
  h.renderProvider(); h.commitProvider();
  assert.equal(h.context.groups[key].number, number);
  assert.equal(h.context.groups[key].count, 1);
  const node = elementNodes(returned.render()).find((entry) => entry.type === "a");
  returned.commit();
  assert.ok(node);
  assert.equal(node.props.href, `#notes-${number}`);
  assert.equal(node.props["aria-label"], `Footnote ${number}`);
  assert.equal(node.props.children, number);
  assert.equal(h.origins.has(number), false, "mounting must not remember an origin");
  const fresh = origin();
  returned.click(fresh);
  h.back(number);
  assert.equal(h.origins.get(number), fresh);
  assert.deepEqual(fresh.calls, expectedBackCalls);
  assert.deepEqual(old.calls, []);
});

test("connected hidden origins survive unrelated registration changes", (t) => {
  const { h, a, number } = mountedPair(t);
  const saved = origin();
  a.click(saved);
  saved.hidden = true;
  const unrelated = h.reference("unrelated", ["source-h"]);
  unrelated.render(); unrelated.commit();
  h.renderProvider(); h.commitProvider();
  assert.equal(h.origins.get(number), saved);
  unrelated.unmount();
  h.renderProvider(); h.commitProvider();
  assert.equal(h.origins.get(number), saved);
  saved.hidden = false;
  assert.equal(h.back(number), 1);
  assert.deepEqual(saved.calls, expectedBackCalls);
});

test("actual Back deletes a detached origin before any lifecycle sweep", (t) => {
  const { h, a, number } = mountedPair(t);
  const saved = origin();
  a.click(saved);
  const groups = h.context.groups;
  saved.isConnected = false;
  assert.equal(h.origins.get(number), saved);
  assert.equal(h.back(number), 1);
  assert.equal(h.origins.has(number), false);
  assert.deepEqual(saved.calls, []);
  assert.equal(h.context.groups, groups);
  assert.equal(h.back(number), 1, "missing-origin Back still prevents default");
  assert.deepEqual(saved.calls, []);
});

test("connected Back keeps exact focus/scroll order and supports repeated returns", (t) => {
  const { h, a, number } = mountedPair(t);
  const saved = origin();
  a.click(saved);
  assert.equal(h.back(number), 1);
  assert.deepEqual(saved.calls, expectedBackCalls);
  assert.equal(h.origins.get(number), saved);
  assert.equal(h.back(number), 1);
  assert.deepEqual(saved.calls, [...expectedBackCalls, ...expectedBackCalls]);
});

test("the last clicked connected reference wins independently for each group", (t) => {
  const { h, a, b, number } = mountedPair(t);
  const other = h.reference("other", ["source-h"]);
  other.render(); other.commit();
  h.renderProvider(); h.commitProvider();
  const otherNumber = h.context.groups["source-h"].number;
  const first = origin(), last = origin(), independent = origin();
  a.click(first); other.click(independent); b.click(last);
  assert.equal(h.origins.size, 2);
  assert.equal(h.origins.get(number), last);
  assert.equal(h.origins.get(otherNumber), independent);
  h.back(number); h.back(otherNumber);
  assert.deepEqual(first.calls, []);
  assert.deepEqual(last.calls, expectedBackCalls);
  assert.deepEqual(independent.calls, expectedBackCalls);
});

test("same-group and sources-only renders do not falsely run the sweep or change registration identity", (t) => {
  const { h, a, number } = mountedPair(t);
  const saved = origin();
  a.click(saved);
  const before = h.context;
  saved.isConnected = false; // External detach, without lifecycle registration changes.
  h.renderProvider([]); // A new sources array alone does not change the effect's groups dependency.
  assert.equal(h.context.groups, before.groups);
  assert.equal(h.context.register, before.register);
  assert.equal(h.context.remember, before.remember);
  assert.equal(h.commitProvider(), 0);
  assert.equal(h.origins.get(number), saved);
  a.render();
  assert.equal(a.commit(), 0, "unchanged reference must not unregister/register");
  h.renderProvider();
  assert.equal(h.context.groups, before.groups);
  assert.equal(h.commitProvider(), 0);
  assert.equal(h.origins.get(number), saved);
  assert.equal(h.back(number), 1);
  assert.equal(h.origins.has(number), false);
});


test("an uncommitted sweep cannot prune or suppress the next committed sweep", (t) => {
  const { h, a, number } = mountedPair(t);
  const saved = origin();
  a.click(saved);
  saved.isConnected = false;
  a.unmount();
  h.renderProvider(); // Deliberately leave this render's effect uncommitted.
  assert.equal(h.origins.get(number), saved);
  h.renderProvider(); // Replaces pending effects, not the last committed dependencies.
  assert.equal(h.origins.get(number), saved);
  assert.equal(h.commitProvider(), 1);
  assert.equal(h.origins.has(number), false);
  assert.equal(h.context.groups["source-g"].count, 1);
});

test("a newly clicked connected sibling survives a pending detached-origin sweep", (t) => {
  const { h, a, b, number } = mountedPair(t);
  const removed = origin(), latest = origin();
  a.click(removed);
  removed.isConnected = false;
  a.unmount();
  h.renderProvider();
  b.click(latest);
  assert.equal(h.origins.get(number), latest);
  h.commitProvider();
  assert.equal(h.origins.get(number), latest);
  h.back(number);
  assert.deepEqual(latest.calls, expectedBackCalls);
  assert.deepEqual(removed.calls, []);
});

test("provider origin ownership is independent across simultaneous instances", (t) => {
  const { h: first, a, number } = mountedPair(t);
  const firstOrigin = origin();
  a.click(firstOrigin);
  const { h: second, a: secondRef, number: secondNumber } = mountedPair(t);
  const secondOrigin = origin();
  secondRef.click(secondOrigin);
  assert.notEqual(first.origins, second.origins);
  assert.equal(first.origins.get(number), firstOrigin);
  assert.equal(second.origins.get(secondNumber), secondOrigin);
  firstOrigin.isConnected = false;
  first.back(number);
  assert.equal(first.origins.size, 0);
  assert.equal(second.origins.get(secondNumber), secondOrigin);
  second.back(secondNumber);
  assert.deepEqual(secondOrigin.calls, expectedBackCalls);
  assert.deepEqual(firstOrigin.calls, []);
});

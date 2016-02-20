// Test suite coverage

import chai, { expect }   from 'chai';
import sinon              from 'sinon';
import sinonChai          from 'sinon-chai';
import Favico             from 'favico.js';

import faviconMiddleware  from '../src/index';

chai.use(sinonChai);

console.log(faviconMiddleware())

describe('faviconMiddleware', () => {
  const next      = sinon.spy();
  const warnStub  = sinon.stub(console, 'warn');
  const errorStub = sinon.stub(console, 'error');

  let storeHandler, nextHandler, actionHandler;

  afterEach( () => {
    // reset our spies and stubs
    next.reset();
    warnStub.reset();
    errorStub.reset();
  });

  describe('initialization', () => {
    it('throws when passed a store directly', () => {
      const store = {
        dispatch: function() {},
        getState: function() {}
      };

      faviconMiddleware(store);

      expect(errorStub).to.have.been.calledOnce;
      expect(next).to.not.have.been.called;
    });
  });

  describe('curried application', () => {
    it('loads the middleware with configs, returns a function', () => {
      storeHandler = faviconMiddleware({ animation: 'fade' });
      expect(storeHandler).to.be.a('function')
    });

    it('loads the store, and returns a function', () => {
      // We don't use the store in my middleware at all.
      // Pass in an empty object, just to match the real-world input type.
      nextHandler = storeHandler({});
      expect(nextHandler).to.be.a('function')
    });

    it('loads next, and returns a function', () => {
      actionHandler = nextHandler(next);
      expect(actionHandler).to.be.a('function')
    });
  });

  describe('dispatching actions', () => {
    const invalidTypes = [
      {},
      [],
      () => {}
    ];

    invalidTypes.forEach( favicon => {
      it('console.warns when an invalid type is supplied', () => {
        const action = { name: 'INVALID', meta: { favicon } };
        actionHandler(action);

        expect(warnStub).to.have.been.calledOnce;
        expect(next).to.have.been.calledOnce;
        // TODO: Check the exact error message for 'illegal type'
      })
    })

    it('console.warns when a decimal number is provided', () => {
      const action = { name: 'INVALID', meta: { favicon: 5.4321 } };
      actionHandler(action);

      expect(warnStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
      // TODO: Check the exact error message for 'integer'
    });

    it('console.warns when an invalid string is provided', () => {
      const action = { name: 'INVALID', meta: { favicon: 'nonsense' } };
      actionHandler(action);

      expect(warnStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
      // TODO: Check the exact error message for 'string'
    });

    it('accepts integer values', () => {
      const action = { name: 'INVALID', meta: { favicon: 4 } };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
      // TODO: Check the exact error message for 'string'
    });

    it('accepts enum string values', () => {
      const action = { name: 'INVALID', meta: { favicon: 'increment' } };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
      // TODO: Check the exact error message for 'string'
    });

    it('is not case-sensitive', () => {
      const action = { name: 'INVALID', meta: { favicon: 'RESET' } };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
      // TODO: Check the exact error message for 'string'
    });

    it('forwards actions with no meta.favicon', () => {
      const action = { name: 'UNRELATED_ACTION' };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });
});

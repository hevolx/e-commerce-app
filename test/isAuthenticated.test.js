const isAuthenticated = require('../middleware/isAuthenticated');

describe('isAuthenticated middleware', () => {
  it('responds with 401 and does not call next when there is no session', () => {
    const req = { isAuthenticated: () => false };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

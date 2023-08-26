const mongoose = require('mongoose');
const express = require('express');
const nodemailer = require('nodemailer');
const { User } = require('../models/user');
const config = require('config');
const jwt = require('jsonwebtoken');
const Token = require('../models/token');

// Mock dependencies
jest.mock('mongoose');
jest.mock('express');
jest.mock('nodemailer');
jest.mock('../models/user');
jest.mock('config');
jest.mock('jsonwebtoken');
jest.mock('../models/token');

describe('POST /', () => {
  let router;
  let req;
  let res;

  beforeEach(() => {
    router = require('./your-router-file');
    req = {
      body: {
        user: {
          email: 'test@example.com'
        },
        password: 'password'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should check if user exists with email', async () => {
    // Mock User.findOne to return a user
    User.findOne.mockResolvedValueOnce({});

    await router(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.user.email });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User Exists with Email'
    });
  });

  it('should create a new user and send email confirmation link', async () => {
    // Mock User.findOne to return null (user does not exist)
    User.findOne.mockResolvedValueOnce(null);

    // Mock jwt.sign to return a token
    jwt.sign.mockReturnValueOnce('mock-token');

    // Mock Token.save to resolve successfully
    Token.prototype.save.mockResolvedValueOnce();

    // Mock nodemailer.createTransport to return a transporter
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValueOnce({ accepted: ['test@example.com'] })
    };
    nodemailer.createTransport.mockReturnValueOnce(mockTransporter);

    await router(req, res);

    expect(User).toHaveBeenCalledWith({ email: req.body.user.email, password: req.body.password });
    expect(jwt.sign).toHaveBeenCalledWith(req.body.user, expect.any(String));
    expect(Token).toHaveBeenCalledWith({ token: 'mock-token' }, expect.any(String));
    expect(Token.prototype.save).toHaveBeenCalled();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      auth: {
        user: expect.any(String),
        pass: expect.any(String)
      },
      secure: true,
      port: 465,
      tls: { rejectUnauthorized: false },
      host: expect.any(String)
    });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: req.body.user.email,
      html: expect.stringContaining('Verify Email Address')
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Confirmation Email Sent!'
    });
  });

  it('should handle errors when sending confirmation email', async () => {
    // Mock User.findOne to return null (user does not exist)
    User.findOne.mockResolvedValueOnce(null);

    // Mock jwt.sign to return a token
    jwt.sign.mockReturnValueOnce('mock-token');

    // Mock Token.save to resolve successfully
    Token.prototype.save.mockResolvedValueOnce();

    // Mock nodemailer.createTransport to return a transporter
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValueOnce({ accepted: [] })
    };
    nodemailer.createTransport.mockReturnValueOnce(mockTransporter);

    await router(req, res);

    expect(res.status).

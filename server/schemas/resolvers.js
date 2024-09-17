const { User, Service, Order } = require('../models');
const { signToken, authMiddleware, AuthenticationError } = require('./auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const stripe = require("stripe")(process.env.REACT_APP_STRIPE_TEST_KEY);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log(process.env.SENDGRID_API_KEY);
console.log(process.env.JWT_SECRET);



const resolvers = {
  Query: {
    users: async () => {
      return await User.find();
    },
    user: async (_, __, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id)
          .populate({
            path: 'orders',
            populate: {
              path: 'services', // Populate services within orders
            },
          });
    
        if (!user) {
          throw new AuthenticationError('User not found');
        }
    
        return user;
      }
      throw new AuthenticationError('You must be logged in');
    },

    getServices: async () => {
      return await Service.find();
    },
    getService: async (_, { _id }) => {
      return await Service.findById(_id);
    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id)
          .populate({
            path: 'orders',
            match: { _id },
            populate: {
              path: 'services',
            },
          });

        if (!user) {
          throw new AuthenticationError('User not found');
        }

        const order = user.orders.id(_id);

        if (!order) {
          throw new Error('Order not found');
        }

        return order;
      }

      throw new AuthenticationError('You must be logged in');
    },
    checkout: async (parent, args, context) => {
      const url = new URL(context.headers.referer).origin;
      const order = new Order({ services: args.services });
      const line_items = [];

      const { services } = await order.populate('services');

      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: service.description,
            },
            unit_amount: service.price * 100,
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`,
      });

      return { session: session.id };
    },
  },
  Mutation: {
    signup: async (_, { name, email, password }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new AuthenticationError('User already exists');
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        const token = signToken(newUser);
        return token;
      } catch (error) {
        throw new Error('Error saving user');
      }
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user);
      return token;
    },
    sendEmail: async (_, { name, email, message }) => {
      try {
        const msgToSelf = {
          to: 'info@rsesthetics.com',
          from: 'em4346@rsesthetics.com',
          replyTo: email,
          subject: 'New Contact Form Submission',
          text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
        };
        await sgMail.send(msgToSelf);

        const autoReplyMsg = {
          to: email,
          from: 'em4346@rsesthetics.com',
          subject: 'Thank You for Contacting Radiant Soul Esthetics',
          text: `Hello ${name},\n\nThank you for reaching out to Radiant Soul Esthetics! Your inquiry is important to us.`,
          html: `<p>Hello ${name},</p><p>Thank you for reaching out to Radiant Soul Esthetics! We have received your message and will get back to you as soon as possible.</p>`,
        };

        await sgMail.send(autoReplyMsg);
        return 'Email sent successfully!';
      } catch (error) {
        throw new Error('Failed to send email. Please try again later.');
      }
    },
    addService: async (parent, { title, description, price }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new AuthenticationError('Unauthorized');
      }

      const service = new Service({ title, description, price });
      const results = await service.save();
      return results;
    },
    updateService: async (_, { id, title, description, price }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new AuthenticationError('Unauthorized');
      }
      return await Service.findByIdAndUpdate(
        id,
        { title, description, price },
        { new: true }
      );
    },
    deleteService: async (_, { id }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new AuthenticationError('Unauthorized');
      }

      return await Service.findOneAndDelete({ _id: id });
    },
    addOrder: async (parent, { services }, context) => {
      if (context.user) {
        const order = new Order({ services });
        await order.save(); 
        await User.findByIdAndUpdate(context.user._id, { $push: { orders: order._id } });
        return order;
      }
      throw new AuthenticationError('You must be logged in');
    },
  },
};

module.exports = resolvers;

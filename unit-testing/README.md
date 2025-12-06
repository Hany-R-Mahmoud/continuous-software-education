# Unit Testing Learning Guide

> **A comprehensive, step-by-step guide to unit testing in TypeScript and React Native**

This guide takes you from absolute beginner to confident unit tester, with a focus on practical, real-world examples and a solid methodology you can use independently.

---

## 📚 Overview

This learning guide is designed for **mid-level frontend engineers** working with **TypeScript and React Native**. It provides:

- **Progressive learning path**: From fundamentals to advanced concepts
- **Practical examples**: Real TypeScript/React Native code
- **Solid methodology**: A reusable process for any testing task
- **Easy to memorize**: Simple patterns and mental models
- **Well organized**: Clear structure, easy to navigate

---

## 🎯 Learning Path

The guide is organized into 7 progressive steps, each building on the previous:

### [Step 1: Fundamentals](./01-fundamentals/)
**What & Why**
- What is unit testing?
- Why we write tests
- Key concepts and terminology

**Files:**
- [`what-is-unit-testing.md`](./01-fundamentals/what-is-unit-testing.md)
- [`why-test.md`](./01-fundamentals/why-test.md)
- [`key-concepts.md`](./01-fundamentals/key-concepts.md)

---

### [Step 2: Tools & Setup](./02-testing-tools/)
**Getting Started**
- Jest overview
- React Native Testing Library
- TypeScript configuration
- Complete setup guide

**Files:**
- [`jest-overview.md`](./02-testing-tools/jest-overview.md)
- [`react-native-testing-library.md`](./02-testing-tools/react-native-testing-library.md)
- [`typescript-configuration.md`](./02-testing-tools/typescript-configuration.md)
- [`setup-guide.md`](./02-testing-tools/setup-guide.md)

---

### [Step 3: Testing Utilities](./03-testing-utilities/)
**Pure Functions First**
- Testing pure functions (easiest starting point)
- Common utility patterns
- Practical examples

**Files:**
- [`testing-pure-functions.md`](./03-testing-utilities/testing-pure-functions.md)
- [`testing-utils.md`](./03-testing-utilities/testing-utils.md)
- [`testing-helpers.md`](./03-testing-utilities/testing-helpers.md)
- [`examples/`](./03-testing-utilities/examples/) - Complete test examples

---

### [Step 4: Testing Patterns](./04-testing-patterns/)
**The Core Methodology**
- AAA Pattern (Arrange, Act, Assert)
- Test structure and organization
- Naming conventions
- Best practices

**Files:**
- [`aaa-pattern.md`](./04-testing-patterns/aaa-pattern.md)
- [`test-structure.md`](./04-testing-patterns/test-structure.md)
- [`naming-conventions.md`](./04-testing-patterns/naming-conventions.md)
- [`best-practices.md`](./04-testing-patterns/best-practices.md)

---

### [Step 5: Testing React Native Components](./05-testing-react-native/)
**Component Testing**
- Component testing basics
- User interactions
- Hooks testing
- Complete examples

**Files:**
- [`component-testing-basics.md`](./05-testing-react-native/component-testing-basics.md)
- [`user-interactions.md`](./05-testing-react-native/user-interactions.md)
- [`hooks-testing.md`](./05-testing-react-native/hooks-testing.md)
- [`examples/`](./05-testing-react-native/examples/) - Component test examples

---

### [Step 6: Advanced Concepts](./06-advanced-concepts/)
**Going Deeper**
- Mocking dependencies
- Async testing
- Snapshot testing
- Test coverage

**Files:**
- [`mocking.md`](./06-advanced-concepts/mocking.md)
- [`async-testing.md`](./06-advanced-concepts/async-testing.md)
- [`snapshot-testing.md`](./06-advanced-concepts/snapshot-testing.md)
- [`test-coverage.md`](./06-advanced-concepts/test-coverage.md)

---

### [Step 7: Your Solid Methodology](./07-methodology/)
**Your Reusable Process**
- Testing checklist
- Decision tree (how to approach any task)
- Common patterns library
- Quick reference guide

**Files:**
- [`testing-checklist.md`](./07-methodology/testing-checklist.md)
- [`decision-tree.md`](./07-methodology/decision-tree.md)
- [`common-patterns.md`](./07-methodology/common-patterns.md)
- [`quick-reference.md`](./07-methodology/quick-reference.md)

---

## 📖 Final Summary

### [Summary Notes](./summary-notes.md)

A complete reference document consolidating everything you've learned:
- All concepts summarized
- Your personal methodology
- Quick reference tables
- Common patterns
- Resources

**Save this file** - it's your go-to reference for unit testing!

---

## 🚀 How to Use This Guide

### For Beginners

1. **Start at Step 1**: Read fundamentals first
2. **Follow sequentially**: Each step builds on the previous
3. **Practice**: Try examples as you go
4. **Don't rush**: Take time to understand each concept
5. **Reference**: Use summary notes when needed

### For Quick Reference

1. **Jump to Step 7**: Methodology and quick reference
2. **Use decision tree**: Determine how to test any code
3. **Check patterns**: Find reusable test templates
4. **Review summary**: Quick refresher on concepts

### For Learning

1. **Read actively**: Don't just skim
2. **Code along**: Type examples yourself
3. **Experiment**: Modify examples
4. **Practice**: Write tests for your own code
5. **Review**: Revisit concepts as needed

---

## 📁 Structure

```
unit-testing/
├── README.md                          # This file
├── summary-notes.md                   # Complete reference
├── 01-fundamentals/                   # Step 1
├── 02-testing-tools/                  # Step 2
├── 03-testing-utilities/              # Step 3
│   └── examples/                      # Example tests
├── 04-testing-patterns/               # Step 4
├── 05-testing-react-native/           # Step 5
│   └── examples/                      # Component examples
├── 06-advanced-concepts/              # Step 6
└── 07-methodology/                    # Step 7
```

---

## 🎓 Key Learning Principles

This guide follows these principles:

1. **Progressive Disclosure**: Each step builds on the previous
2. **Practical Examples**: Real TypeScript/React Native code
3. **Memorization Aids**: Simple patterns and mental models
4. **Visual Organization**: Clear structure, easy to navigate
5. **Actionable**: Each step includes exercises
6. **Reference-Friendly**: Summary can be saved and reused

---

## 💡 Core Concepts

### The AAA Pattern

Every test follows three steps:
1. **Arrange**: Set up the test
2. **Act**: Execute the code
3. **Assert**: Verify the result

### Testing Philosophy

- **Test behavior, not implementation**
- **Test like a user, not like a developer**
- **Keep tests simple and focused**
- **Test normal, edge, and error cases**

### Your Methodology

1. Understand what the code does
2. Decide what to test (use decision tree)
3. Write test following AAA pattern
4. Test normal, edge, and error cases
5. Run tests and verify they pass
6. Review and improve

---

## ✅ What You'll Learn

By the end of this guide, you'll be able to:

- ✅ Understand unit testing fundamentals
- ✅ Set up testing environment for TypeScript/React Native
- ✅ Write tests for utility functions
- ✅ Write tests for React Native components
- ✅ Test user interactions
- ✅ Test custom hooks
- ✅ Mock dependencies
- ✅ Test async code
- ✅ Use testing patterns effectively
- ✅ Apply a solid methodology to any testing task

---

## 🛠️ Prerequisites

- Basic TypeScript knowledge
- Basic React Native knowledge
- Node.js and npm installed
- A React Native project (or create one)

---

## 📚 Resources

- **Jest Documentation**: https://jestjs.io/
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## 🎯 Next Steps

1. **Start with Step 1**: Read the fundamentals
2. **Set up your environment**: Follow Step 2 setup guide
3. **Practice**: Write your first tests in Step 3
4. **Build your methodology**: Work through all steps
5. **Save the summary**: Keep summary notes handy

---

## 💬 Tips for Success

- **Don't skip steps**: Each builds on the previous
- **Practice regularly**: Write tests for your own code
- **Start simple**: Test pure functions first
- **Be patient**: Testing is a skill that improves with practice
- **Use the methodology**: Follow the decision tree and checklist
- **Reference often**: Keep summary notes handy

---

## 📝 Notes

- All examples use TypeScript
- All examples are React Native compatible
- Patterns can be adapted to your needs
- Methodology is reusable for any testing task

---

**Ready to start?** Begin with [Step 1: Fundamentals](./01-fundamentals/what-is-unit-testing.md)!

**Need quick reference?** Jump to [Summary Notes](./summary-notes.md) or [Quick Reference](./07-methodology/quick-reference.md)!

---

*Happy Testing! 🧪*


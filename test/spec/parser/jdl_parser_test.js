'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles,
    JDLParser = require('../../../lib/parser/jdl_parser'),
    JDLEntity = require('../../../lib/core/jdl_entity'),
    JDLEnum = require('../../../lib/core/jdl_enum'),
    JDLField = require('../../../lib/core/jdl_field'),
    JDLValidation = require('../../../lib/core/jdl_validation'),
    JDLUnaryOption = require('../../../lib/core/jdl_unary_option'),
    JDLBinaryOption = require('../../../lib/core/jdl_binary_option'),
    FieldTypes = require('../../../lib/core/jhipster/field_types').SQL_TYPES,
    Validations = require('../../../lib/core/jhipster/validations').VALIDATIONS,
    UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
    BinaryOptions = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
    BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

describe('JDLParser', function () {
  describe('::parse', function () {
    describe('when passing invalid args', function () {
      describe('because there is no document', function () {
        it('fails', function () {
          try {
            JDLParser.parse(null, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no database type', function () {
        it('fails', function () {
          try {
            JDLParser.parse({
              notNull: 42
            }, null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe("because the database type doesn't exist", function () {
        it('fails', function () {
          try {
            JDLParser.parse({
              notNull: 42
            }, 'WRONG');
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalArgumentException');
          }
        });
      });
    });
    describe('when passing valid args', function () {
      describe('with no error', function () {
        it('builds a JDLObject', function () {
          var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          var content = JDLParser.parse(input, 'sql');
          expect(content).not.to.be.null;
          expect(content.entities.Department).to.deep.eq(new JDLEntity({
            name: 'Department',
            tableName: 'Department',
            fields: {
              departmentId: new JDLField({name: 'departmentId', type: FieldTypes.LONG}),
              departmentName: new JDLField({
                name: 'departmentName',
                type: FieldTypes.STRING,
                validations: {required: new JDLValidation({name: Validations.REQUIRED})}
              })
            }
          }));
          expect(content.entities.JobHistory).to.deep.eq(new JDLEntity({
            name: 'JobHistory',
            tableName: 'JobHistory',
            fields: {
              startDate: new JDLField({name: 'startDate', type: FieldTypes.ZONED_DATE_TIME}),
              endDate: new JDLField({name: 'endDate', type: FieldTypes.ZONED_DATE_TIME})
            },
            comment: 'JobHistory comment.'
          }));
          expect(content.enums.JobType).to.deep.eq(new JDLEnum({
            name: 'JobType',
            values: ['TYPE1', 'TYPE2']
          }));
          expect(content.entities.Job).to.deep.eq(new JDLEntity({
            name: 'Job',
            tableName: 'Job',
            fields: {
              jobId: new JDLField({name: 'jobId', type: FieldTypes.LONG}),
              jobTitle: new JDLField({
                name: 'jobTitle',
                type: FieldTypes.STRING,
                validations: {
                  minlength: new JDLValidation({name: Validations.MINLENGTH, value: 5}),
                  maxlength: new JDLValidation({name: Validations.MAXLENGTH, value: 25})
                }
              }),
              type: new JDLField({name: 'type', type: 'JobType'}),
              minSalary: new JDLField({name: 'minSalary', type: FieldTypes.LONG}),
              maxSalary: new JDLField({name: 'maxSalary', type: FieldTypes.LONG})
            }
          }));
          expect(content.options).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_SERVER,
              entityNames: ['Country']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.DTO,
              entityNames: ['Employee'],
              value: BinaryOptionValues.dto.MAPSTRUCT
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SERVICE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.service.SERVICE_CLASS
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['JobHistory', 'Employee'],
              value: BinaryOptionValues.pagination['INFINITE-SCROLL']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['Job'],
              value: BinaryOptionValues.pagination.PAGINATION
            }),
            new JDLBinaryOption({
              name: BinaryOptions.MICROSERVICE,
              entityNames: ['*'],
              value: 'mymicroservice'
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SEARCH_ENGINE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.searchEngine.ELASTIC_SEARCH
            })
          ]);
        });
      });
      describe("with a field name 'id'", function () {
        it("doesn't add it", function () {
          var input = parseFromFiles(['./test/test_files/id_field.jdl']);
          var content = JDLParser.parse(input, 'sql');
          expect(content.entities.A).to.deep.eq(new JDLEntity({
            name: 'A',
            tableName: 'A',
            fields: {
              email: new JDLField({name: 'email', type: FieldTypes.STRING})
            }
          }));
        });
      });
      describe('with an invalid field type', function () {
        it('fails', function () {
          var input = parseFromFiles(['./test/test_files/invalid_field_type.jdl']);
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('WrongTypeException');
          }
        });
      });
      describe('with an unexistent validation for a field type', function () {
        it('fails', function () {
          var input = parseFromFiles(['./test/test_files/non_existent_validation.jdl']);
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('WrongValidationException');
          }
        });
      });
      describe('with entities that do not exist for a relationship', function () {
        it('fails', function () {
          var input = parseFromFiles(['./test/test_files/unexistent_entities_for_relationship.jdl']);
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('UndeclaredEntityException');
          }
        });
      });
      describe('with an invalid option', function () {
        it('fails', function () {
          var input = parseFromFiles(['./test/test_files/invalid_option.jdl']);
          try {
            JDLParser.parse(input, 'sql');
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalArgumentException');
          }
        });
      });
    });
  });
});
import React, { useEffect, useState } from 'react';
import './style.css';
import { Form, Button, Input, Card, Select } from 'antd';
import 'antd/dist/antd.css';
import { Space, Divider } from 'antd';

function Field({ field, error }) {
  const [_error, set_Error] = useState();

  function handleChange() {
    set_Error('');
  }

  useEffect(() => {
    set_Error(error);
  }, [error]);

  return (
    <Form.Item
      key={field.key}
      isList={field.isList || false}
      isListField={field.isListField || false}
      fieldKey={field.fieldKey || field.name}
      label={field.label}
      validateStatus={_error && 'error'}
      help={_error}
      name={field.name}
    >
      {(() => {
        if (field.type == 'select') {
          return (
            <Select
              onChange={handleChange}
              mode={field.multiple && 'multiple'}
              placeholder={field.placeholder || field.label}
            >
              {field.options.map(o => (
                <Select.Option value={o.value}>{o.label}</Select.Option>
              ))}
            </Select>
          );
        } else if (field.type == 'number') {
          //TODO review necessity of width 100% after remove matearilze
          return (
            <InputNumber
              style={{ width: '100%' }}
              parser={field.parser || (value => value)}
              formatter={field.formatter || (value => value)}
              onChange={handleChange}
              placeholder={field.placeholder || field.label}
            />
          );
        } else if (field.type == 'custom') {
          return React.cloneElement(field.component, {
            onChange: handleChange
          });
        } else {
          return (
            <Input
              onChange={handleChange}
              type={field.type || ''}
              placeholder={field.placeholder || field.label}
            />
          );
        }
      })()}
    </Form.Item>
  );
}

function FieldsGenerator({ fields, errors }) {
  return fields.map(f =>
    (() => {
      if (f.type == 'list') {
        return (
          <Form.List key={f.name} name={f.name}>
            {(currentFields, { add, remove }) => (
              <>
                <Divider orientation="left">{f.label}</Divider>
                <Space style={{ width: '100%' }} direction="vertical">
                  <Space style={{ width: '100%' }} direction="vertical">
                    {currentFields.map(currentField => (
                      <Card key={currentField.fieldKey}>
                        <Space style={{ width: '100%' }} direction="vertical">
                          <Button
                            onClick={() => {
                              remove(currentField.name);
                            }}
                          >
                            Remover
                          </Button>
                          {f.fields.map(_f => {
                            _f = { ...currentField, ..._f };
                            _f.htmlName =
                              (f.htmlName || f.name) +
                              '.' +
                              currentField.name +
                              '.' +
                              _f.name;
                            _f.name = [currentField.name, _f.name].join('-');
                            _f.fieldKey = [currentField.fieldKey, _f.name].join(
                              '-'
                            );
                            return (
                              <FieldsGenerator fields={[_f]} errors={errors} />
                            );
                          })}
                        </Space>
                      </Card>
                    ))}
                  </Space>
                  <Button
                    onClick={
                      (f.onAdd &&
                        (() => {
                          f.onAdd(add);
                        })) ||
                      (() => {
                        add();
                      })
                    }
                  >
                    Adicionar
                  </Button>
                </Space>
              </>
            )}
          </Form.List>
        );
      } else {
        return <Field field={f} error={errors[f.htmlName || f.name]} />;
      }
    })()
  );
}

function FormGenerator({
  fields = [],
  buttons = [],
  errors = {},
  onChange = () => {},
  onSubmit = () => {},
  disableButtons = false,
  data = {},
  children
}) {
  const [_errors, set_Errors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      set_Errors(errors);
    }
  }, [errors]);

  function handleChange(_, data) {
    onChange(data);
  }

  function handleSubmit() {
    set_Errors({});
    onSubmit();
    return false;
  }

  return (
    <Form
      initialValues={data}
      onSubmitCapture={handleSubmit}
      onValuesChange={handleChange}
      layout="vertical"
    >
      {fields.length > 0 && (
        <FieldsGenerator fields={fields} errors={_errors} />
      )}
      {children}
      <Divider />
      <Space>
        {buttons.map(b => (
          <Form.Item key={'button' + b.label}>
            <Button
              type={b.type || 'primary'}
              onClick={b.onClick}
              style={b.style || {}}
              htmlType={b.htmlType || 'submit'}
              disabled={disableButtons}
            >
              {b.label}
            </Button>
          </Form.Item>
        ))}
      </Space>
    </Form>
  );
}

export default function App() {
  function handleChange(data) {
    console.log(data);
  }
  return (
    <FormGenerator
      buttons={[
        {
          label: 'Salvar'
        }
      ]}
      data={{}}
      onChange={handleChange}
    >
      <FieldsGenerator
        fields={[
          {
            name: 'areas',
            label: 'Áreas',
            type: 'list',
            fields: [
              {
                label: 'Nome da área',
                name: 'name'
              },
              {
                label: 'Atributos',
                name: 'attributes',
                type: 'list',
                fields: [
                  {
                    name: 'id',
                    label: 'Atributo',
                    type: 'select',
                    options: [
                      {
                        value: 'a',
                        label: 'a'
                      },
                      {
                        value: 'b',
                        label: 'b'
                      }
                    ]
                  },
                  {
                    name: 'adherence',
                    label: 'Aderência'
                  }
                ]
              }
            ]
          }
        ]}
        errors={{}}
      />
    </FormGenerator>
  );
}

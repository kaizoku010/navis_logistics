import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Card, message, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import './PricingModel.css';

function PricingModel() {
  const { user } = useAuth();
  const { savePricingModelToAPI, fetchPricingModelFromAPI, pricingModel, pricingModelLoading } = useDatabase();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.company) {
      fetchPricingModelFromAPI(user.company);
    }
  }, [user, fetchPricingModelFromAPI]);

  useEffect(() => {
    if (pricingModel) {
      form.setFieldsValue({
        ratePerKm: pricingModel.ratePerKm || 0,
        ratePerTon: pricingModel.ratePerTon || 0
      });
    }
  }, [pricingModel, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const pricingData = {
        company: user.company,
        ratePerKm: values.ratePerKm || 0,
        ratePerTon: values.ratePerTon || 0,
        updatedAt: new Date().toISOString()
      };

      await savePricingModelToAPI(pricingData);
      message.success('Pricing model saved successfully!');
    } catch (error) {
      console.error('Error saving pricing model:', error);
      message.error('Failed to save pricing model');
    } finally {
      setSaving(false);
    }
  };

  if (pricingModelLoading) {
    return (
      <div className="pricing-model-loading">
        <Spin size="large" />
        <p>Loading pricing model...</p>
      </div>
    );
  }

  return (
    <div className="pricing-model-container">
      {/* Left Side - Current Configuration */}
      <div className="pricing-model-left">
        <Card className="pricing-config-card">
          <h3 className="config-title">Current Configuration</h3>
          {pricingModel ? (
            <div className="config-details">
              <div className="config-item highlight">
                <div className="config-icon">
                  <i className="fi fi-rr-route"></i>
                </div>
                <div className="config-info">
                  <span className="config-label">Rate per Kilometer</span>
                  <span className="config-value rate">
                    UGX {(pricingModel.ratePerKm || 0).toLocaleString()}
                    <span className="rate-unit"> / km</span>
                  </span>
                </div>
              </div>
              <div className="config-item highlight">
                <div className="config-icon">
                  <i className="fi fi-rr-weight-hanging"></i>
                </div>
                <div className="config-info">
                  <span className="config-label">Rate per Ton</span>
                  <span className="config-value rate">
                    UGX {(pricingModel.ratePerTon || 0).toLocaleString()}
                    <span className="rate-unit"> / ton</span>
                  </span>
                </div>
              </div>
              <div className="config-item">
                <div className="config-icon">
                  <i className="fi fi-rr-building"></i>
                </div>
                <div className="config-info">
                  <span className="config-label">Company</span>
                  <span className="config-value">{pricingModel.company}</span>
                </div>
              </div>
              {pricingModel.updatedAt && (
                <div className="config-item">
                  <div className="config-icon">
                    <i className="fi fi-rr-clock"></i>
                  </div>
                  <div className="config-info">
                    <span className="config-label">Last Updated</span>
                    <span className="config-value">
                      {new Date(pricingModel.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-config">
              <i className="fi fi-rr-info"></i>
              <p>No pricing model configured yet.</p>
              <p>Set up your pricing on the right to start earning!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Right Side - Form */}
      <div className="pricing-model-right">
        <Card className="pricing-form-card">
          <h3 className="form-title">Update Pricing</h3>
          <p className="pricing-model-description">
            Set your rates for distance and weight. Total price = (Distance × Rate/km) + (Weight × Rate/ton)
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              ratePerKm: pricingModel?.ratePerKm || 0,
              ratePerTon: pricingModel?.ratePerTon || 0
            }}
          >
            <Form.Item
              name="ratePerKm"
              label={
                <span className="form-label-with-icon">
                  <i className="fi fi-rr-route"></i> Rate per Kilometer (UGX)
                </span>
              }
              rules={[
                { required: true, message: 'Please enter a rate per km' },
                { type: 'number', min: 0, message: 'Rate must be a positive number' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 5,000"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/,/g, '')}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="ratePerTon"
              label={
                <span className="form-label-with-icon">
                  <i className="fi fi-rr-weight-hanging"></i> Rate per Ton (UGX)
                </span>
              }
              rules={[
                { required: true, message: 'Please enter a rate per ton' },
                { type: 'number', min: 0, message: 'Rate must be a positive number' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 50,000"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/,/g, '')}
                min={0}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} block>
                Save Pricing Model
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default PricingModel;


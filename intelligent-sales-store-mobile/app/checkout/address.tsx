import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { CheckoutHeader } from '@/src/components/checkout/CheckoutHeader';
import {
  createCustomerAddress,
  fetchCustomerAddresses,
} from '@/src/services/checkoutApi';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type {
  CreateAddressPayload,
  CustomerAddress,
} from '@/src/types/checkout';

type AddressForm = {
  alias: string;
  destinatario: string;
  telefono: string;
  direccion_linea_1: string;
  direccion_linea_2: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  referencia: string;
};

const emptyForm: AddressForm = {
  alias: 'Casa',
  destinatario: '',
  telefono: '',
  direccion_linea_1: '',
  direccion_linea_2: '',
  ciudad: '',
  provincia: '',
  codigo_postal: '',
  pais: 'España',
  referencia: '',
};

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').slice(0, 12);
}

function phoneDigits(value: string) {
  const normalized = value.replace(/\D/g, '');

  if (normalized.startsWith('34') && normalized.length === 11) {
    return normalized.slice(2);
  }

  return normalized;
}

export default function AddressScreen() {
  const router = useRouter();

  const { tipo_entrega } = useLocalSearchParams<{
    tipo_entrega?: string;
  }>();

  const [addresses, setAddresses] =
    useState<CustomerAddress[]>([]);
  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] =
    useState<AddressForm>(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadAddresses() {
      try {
        setLoading(true);
        setError('');

        const result = await fetchCustomerAddresses();

        if (!active) return;

        setAddresses(result.addresses);

        const principal =
          result.addresses.find(
            (address) => address.es_principal,
          ) ?? result.addresses[0];

        setSelectedId(
          principal?.id_direccion ?? null,
        );

        if (result.addresses.length === 0) {
          setShowForm(true);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar tus direcciones',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  const formErrors = useMemo(() => {
    const errors: Partial<
      Record<keyof AddressForm, string>
    > = {};

    const alias = form.alias.trim();
    const destinatario = form.destinatario.trim();
    const telefono = form.telefono.trim();
    const direccion = form.direccion_linea_1.trim();
    const direccion2 = form.direccion_linea_2.trim();
    const ciudad = form.ciudad.trim();
    const provincia = form.provincia.trim();
    const codigoPostal = form.codigo_postal.trim();
    const pais = form.pais.trim();
    const referencia = form.referencia.trim();

    if (!alias) {
      errors.alias = 'Introduce un nombre para esta dirección.';
    } else if (alias.length < 2 || alias.length > 30) {
      errors.alias =
        'El alias debe tener entre 2 y 30 caracteres.';
    }

    if (!destinatario) {
      errors.destinatario =
        'Introduce el nombre del destinatario.';
    } else if (
      destinatario.length < 2 ||
      destinatario.length > 80
    ) {
      errors.destinatario =
        'El destinatario debe tener entre 2 y 80 caracteres.';
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(destinatario)) {
      errors.destinatario =
        'El destinatario solo puede contener letras, espacios, guiones y apóstrofes.';
    }

    const digits = phoneDigits(telefono);

    if (!telefono) {
      errors.telefono =
        'Introduce un teléfono de contacto.';
    } else if (digits.length !== 9) {
      errors.telefono =
        'Introduce un teléfono español de 9 dígitos.';
    } else if (!/^[6789]/.test(digits)) {
      errors.telefono =
        'Introduce un número de teléfono español válido.';
    }

    if (!direccion) {
      errors.direccion_linea_1 =
        'Introduce la dirección.';
    } else if (
      direccion.length < 5 ||
      direccion.length > 120
    ) {
      errors.direccion_linea_1 =
        'La dirección debe tener entre 5 y 120 caracteres.';
    }

    if (direccion2.length > 80) {
      errors.direccion_linea_2 =
        'El complemento no puede superar 80 caracteres.';
    }

    if (!ciudad) {
      errors.ciudad =
        'Introduce la ciudad.';
    } else if (
      ciudad.length < 2 ||
      ciudad.length > 60
    ) {
      errors.ciudad =
        'La ciudad debe tener entre 2 y 60 caracteres.';
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(ciudad)) {
      errors.ciudad =
        'La ciudad contiene caracteres no válidos.';
    }

    if (!provincia) {
      errors.provincia =
        'Introduce la provincia.';
    } else if (
      provincia.length < 2 ||
      provincia.length > 60
    ) {
      errors.provincia =
        'La provincia debe tener entre 2 y 60 caracteres.';
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(provincia)) {
      errors.provincia =
        'La provincia contiene caracteres no válidos.';
    }

    if (!codigoPostal) {
      errors.codigo_postal =
        'Introduce el código postal.';
    } else if (
      pais.toLowerCase() === 'españa' &&
      !/^\d{5}$/.test(codigoPostal)
    ) {
      errors.codigo_postal =
        'El código postal español debe contener 5 dígitos.';
    }

    if (!pais) {
      errors.pais =
        'Introduce el país.';
    } else if (
      pais.length < 2 ||
      pais.length > 60
    ) {
      errors.pais =
        'El país debe tener entre 2 y 60 caracteres.';
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(pais)) {
      errors.pais =
        'El país contiene caracteres no válidos.';
    }

    if (referencia.length > 120) {
      errors.referencia =
        'La referencia no puede superar 120 caracteres.';
    }

    return errors;
  }, [form]);

  const formValid =
    Object.keys(formErrors).length === 0;

  function updateField(
    field: keyof AddressForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAddress() {
    if (!formValid) return;

    try {
      setSaving(true);
      setError('');

      const payload: CreateAddressPayload = {
        alias: form.alias.trim() || 'Principal',
        destinatario:
          form.destinatario.trim(),
        telefono:
          form.telefono.trim(),
        direccion_linea_1:
          form.direccion_linea_1.trim(),
        direccion_linea_2:
          form.direccion_linea_2.trim() ||
          undefined,
        ciudad:
          form.ciudad.trim(),
        provincia:
          form.provincia.trim(),
        codigo_postal:
          form.codigo_postal.trim(),
        pais:
          form.pais.trim() || 'España',
        referencia:
          form.referencia.trim() ||
          undefined,
        es_principal:
          addresses.length === 0,
      };

      const result =
        await createCustomerAddress(payload);

      setAddresses((current) => [
        ...current,
        result.address,
      ]);

      setSelectedId(
        result.address.id_direccion,
      );

      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la dirección',
      );
    } finally {
      setSaving(false);
    }
  }

  function continueCheckout() {
    if (!selectedId) return;

    router.push({
      pathname: '/checkout/review',
      params: {
        tipo_entrega:
          tipo_entrega ??
          'ENTREGA_DOMICILIO',
        id_direccion:
          String(selectedId),
      },
    });
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <CheckoutHeader
            title="Dirección de entrega"
            step="Paso 2 de 3"
            backLabel="Entrega"
          />

          <View style={styles.section}>
            <Text style={styles.kicker}>
              DIRECCIÓN
            </Text>

            <Text style={styles.title}>
              ¿Dónde quieres recibir tu pedido?
            </Text>

            <Text style={styles.subtitle}>
              Selecciona una dirección guardada o añade
              una nueva.
            </Text>
          </View>

          {loading ? (
            <View style={styles.state}>
              <ActivityIndicator
                color={colors.primary}
              />

              <Text style={styles.stateText}>
                Cargando direcciones…
              </Text>
            </View>
          ) : null}

          {!loading &&
          addresses.length > 0 ? (
            <View style={styles.addressList}>
              {addresses.map((address) => {
                const selected =
                  selectedId ===
                  address.id_direccion;

                return (
                  <Pressable
                    key={address.id_direccion}
                    onPress={() =>
                      setSelectedId(
                        address.id_direccion,
                      )
                    }
                    style={[
                      styles.addressCard,
                      selected &&
                        styles.addressCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? (
                        <View
                          style={styles.radioInner}
                        />
                      ) : null}
                    </View>

                    <View style={styles.addressInfo}>
                      <View style={styles.addressTop}>
                        <Text
                          style={styles.addressAlias}
                        >
                          {address.alias}
                        </Text>

                        {address.es_principal ? (
                          <Text
                            style={
                              styles.principalBadge
                            }
                          >
                            Principal
                          </Text>
                        ) : null}
                      </View>

                      <Text
                        style={
                          styles.addressRecipient
                        }
                      >
                        {address.destinatario}
                      </Text>

                      <Text
                        style={styles.addressText}
                      >
                        {address.direccion_linea_1}
                      </Text>

                      {address.direccion_linea_2 ? (
                        <Text
                          style={styles.addressText}
                        >
                          {
                            address.direccion_linea_2
                          }
                        </Text>
                      ) : null}

                      <Text
                        style={styles.addressText}
                      >
                        {address.codigo_postal}{' '}
                        {address.ciudad}
                      </Text>

                      <Text
                        style={styles.addressText}
                      >
                        {address.provincia} ·{' '}
                        {address.pais}
                      </Text>

                      <Text
                        style={styles.addressPhone}
                      >
                        {address.telefono}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {!showForm ? (
            <Pressable
              style={styles.addAddressButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.addIcon}>
                +
              </Text>

              <Text
                style={styles.addAddressText}
              >
                Añadir nueva dirección
              </Text>
            </Pressable>
          ) : (
            <View style={styles.formCard}>
              <View>
                <Text style={styles.formTitle}>
                  Nueva dirección
                </Text>

                <Text style={styles.formSubtitle}>
                  Introduce los datos necesarios para
                  la entrega.
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  formErrors.alias &&
                    styles.inputError,
                ]}
                value={form.alias}
                onChangeText={(value) =>
                  updateField('alias', value)
                }
                placeholder="Alias, por ejemplo Casa"
                maxLength={30}
              />

              {formErrors.alias ? (
                <Text style={styles.fieldError}>
                  {formErrors.alias}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.destinatario &&
                    styles.inputError,
                ]}
                value={form.destinatario}
                onChangeText={(value) =>
                  updateField(
                    'destinatario',
                    value,
                  )
                }
                placeholder="Nombre del destinatario"
                autoCapitalize="words"
                maxLength={80}
              />

              {formErrors.destinatario ? (
                <Text
                  style={styles.fieldError}
                >
                  {formErrors.destinatario}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.telefono &&
                    styles.inputError,
                ]}
                value={form.telefono}
                onChangeText={(value) =>
                  updateField(
                    'telefono',
                    normalizePhone(value),
                  )
                }
                placeholder="Teléfono"
                keyboardType="phone-pad"
                maxLength={12}
              />

              {formErrors.telefono ? (
                <Text
                  style={styles.fieldError}
                >
                  {formErrors.telefono}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.direccion_linea_1 &&
                    styles.inputError,
                ]}
                value={form.direccion_linea_1}
                onChangeText={(value) =>
                  updateField(
                    'direccion_linea_1',
                    value,
                  )
                }
                placeholder="Dirección"
                maxLength={120}
              />

              {formErrors.direccion_linea_1 ? (
                <Text style={styles.fieldError}>
                  {formErrors.direccion_linea_1}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.direccion_linea_2 &&
                    styles.inputError,
                ]}
                value={form.direccion_linea_2}
                onChangeText={(value) =>
                  updateField(
                    'direccion_linea_2',
                    value,
                  )
                }
                placeholder="Piso, puerta, bloque (opcional)"
                maxLength={80}
              />

              {formErrors.direccion_linea_2 ? (
                <Text style={styles.fieldError}>
                  {formErrors.direccion_linea_2}
                </Text>
              ) : null}

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.input,
                    styles.rowInput,
                    formErrors.ciudad &&
                      styles.inputError,
                  ]}
                  value={form.ciudad}
                  onChangeText={(value) =>
                    updateField(
                      'ciudad',
                      value,
                    )
                  }
                  placeholder="Ciudad"
                  maxLength={60}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.rowInput,
                    formErrors.codigo_postal &&
                      styles.inputError,
                  ]}
                  value={form.codigo_postal}
                  onChangeText={(value) =>
                    updateField(
                      'codigo_postal',
                      value.replace(/\D/g, ''),
                    )
                  }
                  placeholder="C.P."
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              {formErrors.ciudad ? (
                <Text style={styles.fieldError}>
                  Ciudad: {formErrors.ciudad}
                </Text>
              ) : null}

              {formErrors.codigo_postal ? (
                <Text style={styles.fieldError}>
                  Código postal: {formErrors.codigo_postal}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.provincia &&
                    styles.inputError,
                ]}
                value={form.provincia}
                onChangeText={(value) =>
                  updateField(
                    'provincia',
                    value,
                  )
                }
                placeholder="Provincia"
                maxLength={60}
              />

              {formErrors.provincia ? (
                <Text style={styles.fieldError}>
                  {formErrors.provincia}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.pais &&
                    styles.inputError,
                ]}
                value={form.pais}
                onChangeText={(value) =>
                  updateField('pais', value)
                }
                placeholder="País"
                maxLength={60}
              />

              {formErrors.pais ? (
                <Text style={styles.fieldError}>
                  {formErrors.pais}
                </Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  formErrors.referencia &&
                    styles.inputError,
                ]}
                value={form.referencia}
                onChangeText={(value) =>
                  updateField(
                    'referencia',
                    value,
                  )
                }
                placeholder="Referencia para la entrega (opcional)"
                maxLength={120}
              />

              {formErrors.referencia ? (
                <Text style={styles.fieldError}>
                  {formErrors.referencia}
                </Text>
              ) : null}

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <View style={styles.formActions}>
                {addresses.length > 0 ? (
                  <Pressable
                    style={styles.cancelButton}
                    disabled={saving}
                    onPress={() => {
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                  >
                    <Text
                      style={styles.cancelText}
                    >
                      Cancelar
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={[
                    styles.saveButton,
                    (!formValid || saving) &&
                      styles.disabled,
                  ]}
                  disabled={
                    !formValid || saving
                  }
                  onPress={() =>
                    void saveAddress()
                  }
                >
                  <Text
                    style={styles.saveText}
                  >
                    {saving
                      ? 'Guardando…'
                      : 'Guardar dirección'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {error && !showForm ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            disabled={!selectedId}
            onPress={continueCheckout}
            style={[
              styles.continueButton,
              !selectedId &&
                styles.disabled,
            ]}
          >
            <Text style={styles.continueText}>
              Continuar
            </Text>

            <Text style={styles.continueArrow}>
              ›
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  content: {
    paddingBottom: 60,
  },

  section: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    ...typography.headline,
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  state: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },

  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  addressList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  addressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },

  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: colors.primary,
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  addressInfo: {
    flex: 1,
    gap: spacing.xxs,
  },

  addressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  addressAlias: {
    ...typography.subtitle,
    color: colors.text,
  },

  principalBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  addressRecipient: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  addressText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  addressPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  addAddressButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  addIcon: {
    fontSize: 24,
    color: colors.primary,
  },

  addAddressText: {
    ...typography.button,
    color: colors.primary,
  },

  formCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  formTitle: {
    ...typography.title,
    color: colors.text,
  },

  formSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },

  inputError: {
    borderColor: colors.danger,
  },

  fieldError: {
    ...typography.caption,
    color: colors.danger,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  rowInput: {
    flex: 1,
  },

  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  cancelButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelText: {
    ...typography.button,
    color: colors.text,
  },

  saveButton: {
    flex: 1.5,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },

  saveText: {
    ...typography.button,
    color: colors.white,
  },

  error: {
    ...typography.body,
    color: colors.danger,
    marginHorizontal: spacing.lg,
  },

  continueButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueText: {
    ...typography.button,
    color: colors.white,
  },

  continueArrow: {
    color: colors.white,
    fontSize: 25,
  },

  disabled: {
    opacity: 0.45,
  },
});

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { CheckoutHeader } from '@/src/components/checkout/CheckoutHeader';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type { DeliveryType } from '@/src/types/checkout';

type DeliveryOptionProps = {
  title: string;
  description: string;
  value: DeliveryType;
  selected: boolean;
  onPress: () => void;
};

function DeliveryOption({
  title,
  description,
  selected,
  onPress,
}: DeliveryOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.option,
        selected && styles.optionSelected,
      ]}
    >
      <View
        style={[
          styles.radioOuter,
          selected && styles.radioOuterSelected,
        ]}
      >
        {selected ? <View style={styles.radioInner} /> : null}
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>

        <Text style={styles.optionDescription}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DeliveryScreen() {
  const router = useRouter();

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>('ENTREGA_DOMICILIO');

  function continueCheckout() {
    if (deliveryType === 'ENTREGA_DOMICILIO') {
      router.push({
        pathname: '/checkout/address',
        params: {
          tipo_entrega: deliveryType,
        },
      });

      return;
    }

    router.push({
      pathname: '/checkout/review',
      params: {
        tipo_entrega: deliveryType,
      },
    });
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <CheckoutHeader
          title="Finalizar compra"
          step="Paso 1 de 3"
          backLabel="Carrito"
        />

        <View style={styles.headerText}>
          <Text style={styles.kicker}>
            ENTREGA
          </Text>

          <Text style={styles.title}>
            ¿Cómo quieres recibir tu pedido?
          </Text>

          <Text style={styles.subtitle}>
            Selecciona la modalidad de entrega antes de
            revisar y confirmar tu compra.
          </Text>
        </View>

        <View style={styles.options}>
          <DeliveryOption
            title="Entrega a domicilio"
            description="Recibe tu pedido en una dirección guardada en tu cuenta."
            value="ENTREGA_DOMICILIO"
            selected={
              deliveryType === 'ENTREGA_DOMICILIO'
            }
            onPress={() =>
              setDeliveryType('ENTREGA_DOMICILIO')
            }
          />

          <DeliveryOption
            title="Recogida en almacén"
            description="Recoge personalmente el pedido cuando esté preparado."
            value="RECOJO_ALMACEN"
            selected={
              deliveryType === 'RECOJO_ALMACEN'
            }
            onPress={() =>
              setDeliveryType('RECOJO_ALMACEN')
            }
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Preparación inteligente
          </Text>

          <Text style={styles.infoText}>
            La fecha estimada se calculará al confirmar
            el pedido según disponibilidad y reglas de
            cumplimiento.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={continueCheckout}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continuePressed,
          ]}
        >
          <Text style={styles.continueText}>
            Continuar
          </Text>

          <Text style={styles.continueArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },




  headerText: {
    gap: spacing.sm,
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

  options: {
    gap: spacing.md,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  optionSelected: {
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

  optionContent: {
    flex: 1,
    gap: spacing.xs,
  },

  optionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  optionDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },

  infoCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },

  infoTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  infoText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  continueButton: {
    marginTop: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continuePressed: {
    opacity: 0.88,
  },

  continueText: {
    ...typography.button,
    color: colors.white,
  },

  continueArrow: {
    color: colors.white,
    fontSize: 25,
  },
});

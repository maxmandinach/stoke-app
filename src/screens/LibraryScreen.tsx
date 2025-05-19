import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import { Content } from '../types';
import { contentService } from '../services/content';

const LibraryScreen = () => {
  const [contents, setContents] = React.useState<Content[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchContents = React.useCallback(async () => {
    try {
      const data = await contentService.getContents();
      setContents(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch contents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const renderContentItem = ({ item }: { item: Content }) => (
    <TouchableOpacity 
      style={styles.contentItem}
      onPress={() => {
        // TODO: Navigate to content detail screen
      }}
    >
      <Text style={styles.contentTitle}>{item.title}</Text>
      <Text style={styles.contentSource}>{item.source}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contents}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content added yet</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                // TODO: Navigate to add content screen
              }}
            >
              <Text style={styles.addButtonText}>Add Content</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.md,
  },
  contentItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contentSource: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.background,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});

export default LibraryScreen; 